import { Controller, Get, Headers, Param, Post, Req } from '@nestjs/common';
import { FavoritesAnimesService } from './favorites-animes.service';
import type { Request } from 'express';

@Controller('favorites-animes')
export class FavoritesAnimesController {
  constructor(private readonly favoritesAnimesService: FavoritesAnimesService) { }

  @Post(':id')
  create(
    @Param('id') animeId: number,
    @Req() req: Request
  ) {
    const userId = req.cookies['user_id'];
    return this.favoritesAnimesService.create(animeId, userId);
  }

  @Get()
  findAll(
    @Req() req: Request
  ) {
    const userId = req.cookies['user_id'];
    return this.favoritesAnimesService.findAll(userId);
  }
}
