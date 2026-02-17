import { ConflictException, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { FavoritesAnimeEntity } from 'src/shared/entities/FavoritesAnimeEntity';
import { EntityManager } from 'typeorm';

@Injectable()
export class FavoritesAnimesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly queryBus: QueryBus
  ) { }

  async create(animeId: number, userId: string) {
    const isFavorite = await this.verifyIfExistsFavoriteAnime(userId, animeId);

    if (isFavorite) {
      throw new ConflictException('Anime is already in favorites');
    }

    return this.entityManager.transaction(async transactionalEntityManager => {
      return await transactionalEntityManager.save(FavoritesAnimeEntity, {
        animeId: animeId,
        userId: userId
      });
    });
  }

  private async verifyIfExistsFavoriteAnime(userId: string, animeId: number): Promise<boolean> {
    const favoriteAnime = await this.entityManager.findOne(FavoritesAnimeEntity, {
      where: { userId: userId, animeId: animeId }
    });
    return !!favoriteAnime;
  }

  async findAll(userId: string) {

    if (!userId) {
      throw new Error('User ID is required');
    }

    return this.entityManager.find(FavoritesAnimeEntity, {
      where: { userId: userId }
    });
  }
}
