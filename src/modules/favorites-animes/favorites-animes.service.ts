import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FavoritesAnimeEntity } from 'src/shared/entities/FavoritesAnime.entity';
import { UserEntity } from 'src/shared/entities/UserEntity';
import { EntityManager } from 'typeorm';

@Injectable()
export class FavoritesAnimesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService
  ) { }

  async create(animeId: number, accessToken: string) {
    const userId = await this.getUserIdByAccessToken(accessToken);
    
    const isFavorite = await this.verifyIfExistsFavoriteAnime(userId, animeId);

    if(isFavorite) {
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

  private async getUserIdByAccessToken(accessToken: string): Promise<string> {
    const decodedToken = this.jwtService.verify(accessToken);
    return await this.getUserIdByEmail(decodedToken.username);
  }

  private async getUserIdByEmail(email: string): Promise<string> {
    return this.entityManager.findOne(UserEntity, {
      where: { username: email }
    }).then(user => {
      if(!user) {
        throw new Error('User not found');
      }
      return user.id;
    });
  }

  async findAll(accessToken: string) {
    const userId = await this.getUserIdByAccessToken(accessToken);

    if(!userId) {
      throw new Error('User ID is required');
    }

    return this.entityManager.find(FavoritesAnimeEntity, {
      where: { userId: userId }
    });
  }
}
