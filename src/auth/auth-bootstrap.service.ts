import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TokenStorage } from './token.storage';

/**
 * Service to automatically generate token on app startup
 */
@Injectable()
export class AuthBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AuthBootstrapService.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private tokenStorage: TokenStorage,
  ) {}

  /**
   * Called when module is initialized
   */
  async onModuleInit(): Promise<void> {
    const username = this.configService.get<string>('KITSU_USERNAME');
    const password = this.configService.get<string>('KITSU_PASSWORD');

    if (!username || !password) {
      this.logger.warn(
        'KITSU_USERNAME or KITSU_PASSWORD not configured. ' +
        'Token generation skipped. Please set them in .env',
      );
      return;
    }

    try {
      this.logger.log('Generating token from configured credentials...');
      const token = await this.authService.login({
        username,
        password,
      });

      this.tokenStorage.saveToken(token);
      this.logger.log('Token generated successfully on startup');
    } catch (error) {
      this.logger.error(
        `Failed to generate token on startup: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
