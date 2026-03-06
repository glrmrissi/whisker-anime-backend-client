import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FavoritesAnimesService } from '../favorites-animes/favorites-animes.service';

export type RecommendedAnime = {
  id: string;
  attributes: {
    canonicalTitle: string;
    synopsis: string;
    averageRating: string;
    posterImage: { small: string; medium: string };
    subtype: string;
  };
};

@Injectable()
export class RecommendationsService {
  private readonly recommenderUrl: string;

  constructor(private readonly favoritesService: FavoritesAnimesService) {
    this.recommenderUrl =
      process.env.RECOMMENDER_URL ?? 'http://localhost:3002';
  }

  async getRecommendations(userId: string): Promise<RecommendedAnime[]> {
    const favorites = await this.favoritesService.findAll(userId);

    if (favorites.length === 0) {
      return [];
    }

    const animeIds = favorites.map((f) => f.animeId);

    try {
      const response = await fetch(`${this.recommenderUrl}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeIds }),
      });

      if (!response.ok) {
        throw new Error(`recommender responded with status ${response.status}`);
      }

      return response.json() as Promise<RecommendedAnime[]>;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch recommendations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
