import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  AnimeByIdType,
  KitsuAnimeData,
  KitsuApiService,
} from './kitsu-api.service';
import { ApiGetAnimeSearchByTitle } from './docs/ApiGetAnimeSearchByTitle';
import { Public } from 'src/decorators/set-meta-data.decorator';

@Controller('kitsu-api')
export class KitsuApiController {
  constructor(private readonly kitsuApiService: KitsuApiService) {}

  @Get('trending-anime')
  async getTrendingAnime(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<KitsuAnimeData> {
    const finalLimit = limit || 10;
    return this.kitsuApiService.getTrendingAnime(finalLimit);
  }

  @Get('anime')
  async getAnimeList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('subtype') subtype?: string,
  ): Promise<KitsuAnimeData> {
    const finalPage = page ? parseInt(page, 10) : 1;
    const finalLimit = limit ? parseInt(limit, 10) : 10;
    const offset = (finalPage - 1) * finalLimit;
    return this.kitsuApiService.getAnimeWithPagination(
      finalLimit,
      offset,
      sort,
      subtype,
    );
  }

  @ApiGetAnimeSearchByTitle()
  @Get('anime/search')
  @Public()
  async searchAnime(
    @Query('title') title: string,
    @Query('limit') limit?: number,
  ): Promise<KitsuAnimeData> {
    const finalLimit = limit || 10;
    return this.kitsuApiService.searchAnime(title, finalLimit);
  }
  @Public()
  @Get('episodes/:id')
  async getEpisode(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    return this.kitsuApiService.getEpisode(id);
  }

  @Public()
  @Get('anime/:id/episodes')
  async getAnimeEpisodes(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('page[limit]', new ParseIntPipe({ optional: true })) pageLimit?: number,
    @Query('page[offset]', new ParseIntPipe({ optional: true })) pageOffset?: number,
  ): Promise<unknown> {
    const finalLimit = limit ?? pageLimit ?? 20;
    const finalOffset = offset ?? pageOffset ?? 0;
    return this.kitsuApiService.getAnimeEpisodes(id, finalLimit, finalOffset);
  }

  @Public()
  @Get('anime/:id')
  async getAnime(
    @Param('id', ParseIntPipe) id: number,
    @Query('include') include: string,
  ): Promise<AnimeByIdType> {
    return this.kitsuApiService.getAnime(id, include);
  }
}
