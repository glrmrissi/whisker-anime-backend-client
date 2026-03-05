import { Controller, Get, Param, Post } from '@nestjs/common';
import { FavoritesAnimesService } from './favorites-animes.service';
import { FavoritesAnimeEntity } from 'src/shared/entities/FavoritesAnimeEntity';
import { User } from 'src/decorators/user.decorator';

@Controller('favorites-animes')
export class FavoritesAnimesController {
  constructor(
    private readonly favoritesAnimesService: FavoritesAnimesService,
  ) {}

  @Post(':id')
  create(
    @Param('id') animeId: number,
    @User('sub') userId: string,
  ): Promise<object> {
    return this.favoritesAnimesService.create(animeId, userId);
  }

  @Get()
  findAll(@User('sub') userId: string): Promise<FavoritesAnimeEntity[]> {
    return this.favoritesAnimesService.findAll(userId);
  }
}
