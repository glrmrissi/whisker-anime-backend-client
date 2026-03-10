import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request as ExpressRequest, Response } from 'express';
import { UserAuthService } from './user-auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Public } from 'src/decorators/set-meta-data.decorator';
import { Throttle } from '@nestjs/throttler';

type AuthenticatedRequest = ExpressRequest & {
  user: unknown;
};

@ApiTags('User Auth')
@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @ApiOperation({ summary: 'Health check', description: 'Simple ping endpoint to verify the auth service is reachable.' })
  @ApiResponse({ status: 200, description: 'Service is alive.', schema: { properties: { message: { type: 'string', example: 'pong' } } } })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('ping')
  ping() {
    return { message: 'pong' };
  }

  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account with a nickname, email and strong password.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 200, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error or email already in use.' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.userAuthService.register(registerDto);
  }

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates the user and sets HttpOnly cookies `x_access_token` (1 h) and `x_refresh_token` (7 d). Rate-limited to 10 requests per minute.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful — auth cookies set.', schema: { properties: { message: { type: 'string', example: 'Login successful' } } } })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  @ApiResponse({ status: 429, description: 'Too many requests — rate limit exceeded.' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000, blockDuration: 30000 } })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: ExpressRequest,
  ) {
    const tokens = await this.userAuthService.login(loginDto);

    try {
      await this.userAuthService.saveUserAgent(
        req.headers['user-agent'] ?? 'unknown',
        tokens.userId,
        req.ip ?? 'unknown',
      );
    } catch {
      console.error('Failed to save browser fingerprint');
    }

    res.cookie('x_access_token', tokens.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 3600000,
    });
    res.cookie('x_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600000,
    });

    return { message: 'Login successful' };
  }

  @ApiOperation({ summary: 'Refresh user access token', description: 'Exchanges a refresh token for a new access token.' })
  @ApiBody({ schema: { properties: { refresh_token: { type: 'string', description: 'Valid refresh token' } } } })
  @ApiResponse({ status: 200, description: 'New access token returned.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  @ApiCookieAuth('x_access_token')
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: { refresh_token: string }) {
    return this.userAuthService.refreshToken(refreshTokenDto.refresh_token);
  }

  @ApiOperation({
    summary: 'Request a password reset',
    description: 'Sends a password reset link to the provided email if an account exists. Always returns 200 to prevent user enumeration.',
  })
  @ApiBody({ schema: { properties: { username: { type: 'string', example: 'user@example.com', description: 'Registered email address' } } } })
  @ApiResponse({ status: 200, description: 'Reset link sent (if email exists).', schema: { properties: { message: { type: 'string', example: 'Password reset link sent if email exists' } } } })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('username') username: string) {
    await this.userAuthService.forgotPassword(username);
    return { message: 'Password reset link sent if email exists' };
  }

  @ApiOperation({ summary: 'Set a new password', description: 'Resets the user password using the verification code sent by email.' })
  @ApiBody({
    schema: {
      required: ['username', 'newPassword', 'code'],
      properties: {
        username: { type: 'string', example: 'user@example.com' },
        newPassword: { type: 'string', example: 'NewP@ssw0rd!' },
        code: { type: 'string', example: '123456', description: 'Verification code received by email' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully.', schema: { properties: { message: { type: 'string', example: 'Password updated successfully' } } } })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code.' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Patch('new-password')
  async newPassword(
    @Body('username') username: string,
    @Body('newPassword') newPassword: string,
    @Body('code') code: string,
  ) {
    await this.userAuthService.newPassword(username, newPassword, code);
    return { message: 'Password updated successfully' };
  }

  @ApiOperation({ summary: 'Get authenticated user profile', description: 'Returns the decoded JWT payload for the currently authenticated user.' })
  @ApiCookieAuth('x_access_token')
  @ApiResponse({ status: 200, description: 'Authenticated user payload.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid authentication token.' })
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
