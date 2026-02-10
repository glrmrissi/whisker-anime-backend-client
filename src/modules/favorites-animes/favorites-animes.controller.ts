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
    const accessToken = req.cookies['x_access_token'];
    return this.favoritesAnimesService.create(animeId, accessToken);
  }

  @Get()
  findAll(
    @Req() req: Request
  ) {
    const accessToken = req.cookies['x_access_token'];
    return this.favoritesAnimesService.findAll(accessToken);
  }
}
