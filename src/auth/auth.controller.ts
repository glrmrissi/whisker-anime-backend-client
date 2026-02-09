import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenStorage } from './token.storage';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { TokenResponseDto } from './dtos/token-response.dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserDto } from './querys/get-user.handler';
import { Public } from 'src/decorators/set-meta-data.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenStorage: TokenStorage,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * Login endpoint - Password Grant Flow
   * POST /auth/login
   * @param loginDto - { username: string, password: string }
   * @returns Access token and refresh token
   */
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

  /**
   * Refresh Token endpoint
   * POST /auth/refresh
   * @param refreshTokenDto - { refresh_token: string }
   * @returns New access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
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

  @Get('token')
  getTokenStatus() {
    return {
      hasToken: this.tokenStorage.hasToken(),
      isExpired: this.tokenStorage.isTokenExpired(),
      expiresIn: this.tokenStorage.getToken()?.expires_in || null,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    this.tokenStorage.clearToken();
    return { message: 'Logged out successfully' };
  }

  @Get('user/:id')
  @Public()
  getUser(@Param('id') id: string) {
    const query = new GetUserDto();
    query.id = id;
    return this.queryBus.execute(query);
  }
}

