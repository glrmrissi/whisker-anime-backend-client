import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';

export function ApiGetAnimeSearchByTitle() {
  return applyDecorators(
    ApiOperation({ summary: 'Search anime by title', description: 'Searches the Kitsu API for animes matching the given title. Public endpoint — no auth required.' }),
    ApiQuery({ name: 'title', required: true, description: 'Anime title to search for', example: 'Naruto' }),
    ApiQuery({ name: 'limit', required: false, description: 'Number of results (default: 10)', example: 10 }),
    ApiResponse({ status: 200, description: 'List of matching animes.' }),
    ApiBadRequestResponse({ description: 'Missing or invalid title parameter.' }),
  );
}
