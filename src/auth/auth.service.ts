import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { TokenResponseDto } from './dtos/token-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly kitsuOAuthUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private configService: ConfigService
  ) {
    this.kitsuOAuthUrl = this.configService.get<string>(
      'KITSU_API_URL',
      'https://kitsu.io/api/oauth/token',
    );
    this.clientId = this.configService.get<string>('CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('CLIENT_SECRET', '');
  }


  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const { username, password } = loginDto;

    const body = new URLSearchParams();
    body.append('grant_type', 'password');
    body.append('username', username);
    body.append('password', password);

    if (this.clientId) {
      body.append('client_id', this.clientId);
    }
    if (this.clientSecret) {
      body.append('client_secret', this.clientSecret);
    }

    this.logger.debug(`Attempting login for user: ${username}`);
    this.logger.debug(`OAuth URL: ${this.kitsuOAuthUrl}`);

    try {
      const response = await fetch(this.kitsuOAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[AUTH] Error response:', errorData);
        throw new Error(
          `${errorData.error}: ${errorData.error_description || 'Unknown error'}`,
        );
      }

      const tokenData = await response.json();
      return this.mapToTokenResponse(tokenData);
    } catch (error) {
      throw new Error(
        `Failed to obtain access token: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    const { refresh_token } = refreshTokenDto;

    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refresh_token);

    if (this.clientId) {
      body.append('client_id', this.clientId);
    }
    if (this.clientSecret) {
      body.append('client_secret', this.clientSecret);
    }

    try {
      const response = await fetch(this.kitsuOAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `OAuth token refresh failed: ${response.statusText}`,
        );
      }

      const tokenData = await response.json();
      return this.mapToTokenResponse(tokenData);
    } catch (error) {
      throw new Error(
        `Failed to refresh access token: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Map OAuth response to standardized TokenResponseDto
   */
  private mapToTokenResponse(data: any): TokenResponseDto {
    return {
      access_token: data.access_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      scope: data.scope,
      created_at: data.created_at,
    };
  }
}
