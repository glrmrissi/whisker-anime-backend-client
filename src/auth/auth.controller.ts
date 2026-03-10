import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenStorage } from './token.storage';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { TokenResponseDto } from './dtos/token-response.dto';

@ApiTags('Auth (Service)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenStorage: TokenStorage,
  ) {}

  @ApiOperation({
    summary: 'Service login (Password Grant Flow)',
    description: 'Authenticates the backend service against Keycloak using client credentials and stores the token internally for downstream requests.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful — returns access and refresh tokens.', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid credentials or login failure.' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    try {
      const token = await this.authService.login(loginDto);
      this.tokenStorage.saveToken(token);
      return token;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Login failed',
      );
    }
  }

  @ApiOperation({
    summary: 'Refresh the service access token',
    description: 'Exchanges the stored refresh token for a new access token and updates internal storage.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired refresh token.' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    try {
      const token = await this.authService.refreshToken(refreshTokenDto);
      this.tokenStorage.saveToken(token);
      return token;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Token refresh failed',
      );
    }
  }

  @ApiOperation({
    summary: 'Get current service token status',
    description: 'Returns whether the service holds a valid token, whether it is expired, and its remaining lifetime.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token status info.',
    schema: {
      properties: {
        hasToken: { type: 'boolean', example: true },
        isExpired: { type: 'boolean', example: false },
        expiresIn: { type: 'number', example: 3600, nullable: true },
      },
    },
  })
  @Get('token')
  getTokenStatus() {
    return {
      hasToken: this.tokenStorage.hasToken(),
      isExpired: this.tokenStorage.isTokenExpired(),
      expiresIn: this.tokenStorage.getToken()?.expires_in || null,
    };
  }

  @ApiOperation({
    summary: 'Logout and clear stored service token',
    description: 'Clears the internally stored access token. Does not revoke the token on the auth server.',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully.', schema: { properties: { message: { type: 'string', example: 'Logged out successfully' } } } })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    this.tokenStorage.clearToken();
    return { message: 'Logged out successfully' };
  }
}
