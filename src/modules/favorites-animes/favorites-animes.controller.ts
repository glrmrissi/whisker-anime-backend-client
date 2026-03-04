import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { FavoritesAnimesService } from './favorites-animes.service';
import type { Request } from 'express';
import { FavoritesAnimeEntity } from 'src/shared/entities/FavoritesAnimeEntity';

@Controller('favorites-animes')
export class FavoritesAnimesController {
  constructor(
    private readonly favoritesAnimesService: FavoritesAnimesService,
  ) {}

  @Post(':id')
  create(@Param('id') animeId: number, @Req() req: Request): Promise<object> {
    const userId = (req.cookies['user_id'] as string | undefined) ?? 'unknown';
    return this.favoritesAnimesService.create(animeId, userId);
  }

  @Get()
  findAll(@Req() req: Request): Promise<FavoritesAnimeEntity[]> {
    const userId = (req.cookies['user_id'] as string | undefined) ?? 'unknown';
    return this.favoritesAnimesService.findAll(userId);
  }
}
