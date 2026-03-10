import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FavoritesAnimesService } from './favorites-animes.service';
import { FavoritesAnimeEntity } from 'src/shared/entities/FavoritesAnimeEntity';
import { User } from 'src/decorators/user.decorator';

@ApiTags('Favorites')
@Controller('favorites-animes')
export class FavoritesAnimesController {
  constructor(
    private readonly favoritesAnimesService: FavoritesAnimesService,
  ) {}

  @ApiOperation({ summary: 'Add an anime to favorites', description: 'Toggles the given anime as a favorite for the authenticated user. Creates the record if it does not exist.' })
  @ApiParam({ name: 'id', description: 'Kitsu anime ID', example: 12345 })
  @ApiResponse({ status: 201, description: 'Anime added to favorites.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Post(':id')
  create(
    @Param('id') animeId: number,
    @User('sub') userId: string,
  ): Promise<object> {
    return this.favoritesAnimesService.create(animeId, userId);
  }

  @ApiOperation({ summary: 'List all favorite animes', description: 'Returns all animes marked as favorite by the authenticated user.' })
  @ApiResponse({ status: 200, description: 'List of favorite animes.', type: [FavoritesAnimeEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get()
  findAll(@User('sub') userId: string): Promise<FavoritesAnimeEntity[]> {
    return this.favoritesAnimesService.findAll(userId);
  }
}
