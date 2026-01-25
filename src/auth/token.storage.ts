import { Injectable, Logger } from '@nestjs/common';
import { TokenResponseDto } from './dtos/token-response.dto';

@Injectable()
export class TokenStorage {
    private tokenData: TokenResponseDto | null = null;
    private readonly logger = new Logger(TokenStorage.name)

    /**
     * Store the token response
     */
    saveToken(token: TokenResponseDto): void {
        this.tokenData = token;
        this.logger.debug('Token saved successfully');
    }

    /**
     * Get the stored access token
     */
    getAccessToken(): string | null {
        return this.tokenData?.access_token || null;
    }

    /**
     * Get the stored refresh token
     */
    getRefreshToken(): string | null {
        return this.tokenData?.refresh_token || null;
    }

    /**
     * Get all token data
     */
    getToken(): TokenResponseDto | null {
        return this.tokenData;
    }

    /**
     * Clear stored tokens
     */
    clearToken(): void {
        this.tokenData = null;
        this.logger.debug('Token cleared');
    }

    /**
     * Check if token exists
     */
    hasToken(): boolean {
        return this.tokenData !== null && !!this.tokenData.access_token;
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(): boolean {
        if (!this.tokenData || !this.tokenData.created_at || !this.tokenData.expires_in) {
            return true;
        }

        const expirationTime = this.tokenData.created_at + this.tokenData.expires_in;
        const currentTime = Math.floor(Date.now() / 1000);

        return currentTime >= expirationTime;
    }
}
