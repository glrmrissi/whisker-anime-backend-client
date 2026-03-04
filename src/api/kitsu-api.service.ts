import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { TokenStorage } from '../auth/token.storage';

export type KitsuLinks = {
  self: string;
};

export type KitsuTitles = {
  en?: string;
  en_jp?: string;
  ja_jp?: string;
  [key: string]: string | undefined;
};

export type KitsuPosterImage = {
  tiny?: string;
  large?: string;
  small?: string;
  medium?: string;
  original?: string;
  meta?: {
    dimensions?: {
      tiny?: { width: number; height: number };
      large?: { width: number; height: number };
      small?: { width: number; height: number };
      medium?: { width: number; height: number };
    };
  };
};

export type KitsuCoverImage = {
  tiny?: string;
  large?: string;
  small?: string;
  original?: string;
  meta?: {
    dimensions?: {
      tiny?: { width: number; height: number };
      large?: { width: number; height: number };
      small?: { width: number; height: number };
    };
  };
};

export type KitsuRatingFrequencies = {
  [rating: string]: string;
};

export type KitsuRelationshipLink = {
  links: {
    self: string;
    related: string;
  };
};

export type KitsuAnimeAttributes = {
  createdAt: string;
  updatedAt: string;
  slug: string;
  synopsis: string;
  description: string;
  coverImageTopOffset: number;
  titles: KitsuTitles;
  canonicalTitle: string;
  abbreviatedTitles: string[];
  averageRating: string | null;
  ratingFrequencies: KitsuRatingFrequencies;
  userCount: number;
  favoritesCount: number;
  startDate: string | null;
  endDate: string | null;
  nextRelease: string | null;
  popularityRank: number | null;
  ratingRank: number | null;
  ageRating: 'G' | 'PG' | 'R' | 'R18' | null;
  ageRatingGuide: string | null;
  subtype: 'ONA' | 'OVA' | 'TV' | 'movie' | 'music' | 'special';
  status: 'current' | 'finished' | 'tba' | 'unreleased' | 'upcoming';
  tba: string | null;
  posterImage: KitsuPosterImage;
  coverImage: KitsuCoverImage | null;
  episodeCount: number | null;
  episodeLength: number | null;
  totalLength: number;
  youtubeVideoId: string | null;
  showType: 'ONA' | 'OVA' | 'TV' | 'movie' | 'music' | 'special';
  nsfw: boolean;
};

export type KitsuAnimeRelationships = {
  genres: KitsuRelationshipLink;
  categories: KitsuRelationshipLink;
  castings: KitsuRelationshipLink;
  installments: KitsuRelationshipLink;
  mappings: KitsuRelationshipLink;
  reviews: KitsuRelationshipLink;
  mediaRelationships: KitsuRelationshipLink;
  characters: KitsuRelationshipLink;
  staff: KitsuRelationshipLink;
  productions: KitsuRelationshipLink;
  quotes: KitsuRelationshipLink;
  episodes: KitsuRelationshipLink;
  streamingLinks: KitsuRelationshipLink;
  animeProductions: KitsuRelationshipLink;
  animeCharacters: KitsuRelationshipLink;
  animeStaff: KitsuRelationshipLink;
};

export type KitsuAnimeData = {
  id: string;
  type: 'anime';
  links: KitsuLinks;
  attributes: KitsuAnimeAttributes;
  relationships: KitsuAnimeRelationships;
};

export type KitsuStreamingLinkAttributes = {
  createdAt: string;
  updatedAt: string;
  url: string;
  subs: string[];
  dubs: string[];
};

export type KitsuStreamingLinkRelationships = {
  streamer: KitsuRelationshipLink;
  media: KitsuRelationshipLink;
};

export type KitsuStreamingLink = {
  id: string;
  type: 'streamingLinks';
  links: KitsuLinks;
  attributes: KitsuStreamingLinkAttributes;
  relationships: KitsuStreamingLinkRelationships;
};

export type AnimeByIdType = {
  data: KitsuAnimeData;
  included: KitsuStreamingLink[];
};

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
        throw new BadRequestException(
          'No refresh token available. Please login again.',
        );
      }

      try {
        const newToken = await this.authService.refreshToken({
          refresh_token: refreshToken,
        });
        this.tokenStorage.saveToken(newToken);
        accessToken = newToken.access_token;
      } catch (error) {
        throw new BadRequestException(
          `Failed to refresh token: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (!accessToken) {
      throw new BadRequestException(
        'No access token available. Please login first.',
      );
    }

    return {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    };
  }

  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
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
        const errorData = (await response.json()) as {
          errors?: { detail: string }[];
        };
        throw new Error(
          `API Error: ${errorData.errors?.[0]?.detail ?? response.statusText}`,
        );
      }

      return response.json() as Promise<T>;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch from Kitsu API: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getAnime(id: number, include: string): Promise<AnimeByIdType> {
    const params: Record<string, any> = {
      include: include,
    };
    return this.get(`/anime/${id}`, params);
  }

  async searchAnime(
    title: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<KitsuAnimeData> {
    return this.get('/anime', {
      'filter[text]': title,
      'page[limit]': limit,
      'page[offset]': offset,
    });
  }

  async getTrendingAnime(limit: number): Promise<KitsuAnimeData> {
    return this.get('/trending/anime', {
      limit: limit,
    });
  }

  async getLibraryEntries(
    userId: number,
    status?: string,
  ): Promise<KitsuAnimeData> {
    const params: Record<string, any> = {
      'filter[userId]': userId,
      'page[limit]': 20,
    };

    if (status) {
      params['filter[status]'] = status;
    }

    return this.get('/library-entries', params);
  }

  async getCurrentUser(): Promise<KitsuAnimeData> {
    return this.get('/users', {
      'filter[self]': true,
    });
  }

  async getAnimeWithPagination(
    limit: number,
    offset: number,
    sort?: string,
    subtype?: string,
  ): Promise<KitsuAnimeData> {
    const params: Record<string, any> = {
      'page[limit]': limit,
      'page[offset]': offset,
      sort: sort,
      'filter[subtype]': subtype,
    };

    return this.get('/anime', params);
  }
}
