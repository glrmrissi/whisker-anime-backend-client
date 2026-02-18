import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { TokenStorage } from '../auth/token.storage';


@Injectable()
export class KitsuApiService {
  private readonly baseUrl = 'https://kitsu.io/api/edge';
  

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorage,
  ) {}

  private async getAuthHeaders(): Promise<Record<string, string>> {
    let accessToken = this.tokenStorage.getAccessToken();

    if (this.tokenStorage.isTokenExpired()) {
      console.log('[KITSU-API] Token expired, refreshing...');
      const refreshToken = this.tokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new BadRequestException('No refresh token available. Please login again.');
      }

      try {
        const newToken = await this.authService.refreshToken({ refresh_token: refreshToken });
        this.tokenStorage.saveToken(newToken);
        accessToken = newToken.access_token;
      } catch (error) {
        throw new BadRequestException(
          `Failed to refresh token: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (!accessToken) {
      throw new BadRequestException('No access token available. Please login first.');
    }

    return {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    };
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API Error: ${errorData.errors?.[0]?.detail || response.statusText}`,
        );
      }

      return response.json() as Promise<T>;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch from Kitsu API: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getAnime(id: number, include?: string): Promise<any> {
    const params: Record<string, any> = {};
    if (include) {
      params['include'] = include;
    }

    return this.get(`/anime/${id}`, params);
  }

  async searchAnime(title: string, limit: number = 10, offset: number = 0): Promise<any> {
    return this.get('/anime', {
      'filter[text]': title,
      'page[limit]': limit,
      'page[offset]': offset,
    });
  }

  async getTrendingAnime(limit: number): Promise<any> {
    return this.get('/trending/anime', {
      'limit': limit
    });
  }

  async getLibraryEntries(userId: number, status?: string): Promise<any> {
    const params: Record<string, any> = {
      'filter[userId]': userId,
      'page[limit]': 20,
    };

    if (status) {
      params['filter[status]'] = status;
    }

    return this.get('/library-entries', params);
  }

  async getCurrentUser(): Promise<any> {
    return this.get('/users', {
      'filter[self]': true,
    });
  }

  async getAnimeWithPagination(limit: number, offset: number, sort?: string, subtype?: string): Promise<any> {
    const params: Record<string, any> = {
      'page[limit]': limit,
      'page[offset]': offset,
      'sort': sort,
      'filter[subtype]': subtype
    };

    return this.get('/anime', params);
  }
}
