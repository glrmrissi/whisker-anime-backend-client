import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  AnimeByIdType,
  KitsuAnimeData,
  KitsuApiService,
} from './kitsu-api.service';

@ApiTags('Kitsu API')
@Controller('kitsu-api')
export class KitsuApiController {
  constructor(private readonly kitsuApiService: KitsuApiService) {}

  @ApiOperation({ summary: 'Get trending anime', description: 'Returns the current trending anime list from the Kitsu API.' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return (default: 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'List of trending animes.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get('trending-anime')
  async getTrendingAnime(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<KitsuAnimeData> {
    const finalLimit = limit || 10;
    return this.kitsuApiService.getTrendingAnime(finalLimit);
  }

  @ApiOperation({ summary: 'Get paginated anime list', description: 'Returns a paginated list of animes with optional sorting and subtype filtering.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page (default: 10)', example: 10 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field (e.g. -averageRating)', example: '-averageRating' })
  @ApiQuery({ name: 'subtype', required: false, description: 'Filter by subtype (TV, movie, OVA, etc.)', example: 'TV' })
  @ApiResponse({ status: 200, description: 'Paginated list of animes.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
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

  @ApiOperation({ summary: 'Search anime by title', description: 'Searches the Kitsu API for animes matching the given title. Public endpoint — no auth required.' })
  @ApiQuery({ name: 'title', required: true, description: 'Anime title to search for', example: 'Naruto' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results (default: 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'List of matching animes.' })
  @ApiResponse({ status: 400, description: 'Missing or invalid title parameter.' })
  @Get('anime/search')
  async searchAnime(
    @Query('title') title: string,
    @Query('limit') limit?: number,
  ): Promise<KitsuAnimeData> {
    const finalLimit = limit || 10;
    return this.kitsuApiService.searchAnime(title, finalLimit);
  }

  @ApiOperation({ summary: 'Get episode by ID', description: 'Returns detailed information for a single episode. Public endpoint — no auth required.' })
  @ApiParam({ name: 'id', description: 'Kitsu episode ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Episode details.' })
  @ApiResponse({ status: 404, description: 'Episode not found.' })
  @Get('episodes/:id')
  async getEpisode(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<unknown> {
    return this.kitsuApiService.getEpisode(id);
  }

  @ApiOperation({ summary: 'Get episodes for an anime', description: 'Returns a paginated list of episodes for the given anime. Public endpoint — no auth required.' })
  @ApiParam({ name: 'id', description: 'Kitsu anime ID', example: 12345 })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page (default: 20)', example: 20 })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination (default: 0)', example: 0 })
  @ApiResponse({ status: 200, description: 'Paginated episode list.' })
  @ApiResponse({ status: 404, description: 'Anime not found.' })
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

  @ApiOperation({ summary: 'Get anime by ID', description: 'Returns full details for a single anime. Pass `include` to sideload related resources (e.g. genres, categories). Public endpoint — no auth required.' })
  @ApiParam({ name: 'id', description: 'Kitsu anime ID', example: 12345 })
  @ApiQuery({ name: 'include', required: false, description: 'Comma-separated list of related resources to include (e.g. genres,categories)', example: 'genres,categories' })
  @ApiResponse({ status: 200, description: 'Anime details.' })
  @ApiResponse({ status: 404, description: 'Anime not found.' })
  @Get('anime/:id')
  async getAnime(
    @Param('id', ParseIntPipe) id: number,
    @Query('include') include: string,
  ): Promise<AnimeByIdType> {
    return this.kitsuApiService.getAnime(id, include);
  }
}
