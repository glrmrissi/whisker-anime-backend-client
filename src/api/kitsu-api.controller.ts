import { Body, Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { KitsuApiService } from "./kitsu-api.service";
import { ApiGetAnimeSearchByTitle } from "./docs/ApiGetAnimeSearchByTitle";

@Controller('kitsu-api')
export class KitsuApiController {
    constructor(private readonly kitsuApiService: KitsuApiService) { }

    @Get('status')
    async getStatus() {
        return { status: 'Kitsu API Controller is operational' };
    }

    @Get('trending-anime')
    async getTrendingAnime(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
        const finalLimit = limit || 10;
        return this.kitsuApiService.getTrendingAnime(finalLimit);
    }

    @Get('anime')
    async getAnimeList(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('nsfw') nsfw?: string,
    ) {
        const finalPage = page ? parseInt(page, 10) : 1;
        const finalLimit = limit ? parseInt(limit, 10) : 10;
        const offset = (finalPage - 1) * finalLimit;
        return this.kitsuApiService.getAnimeWithPagination(finalLimit, offset, nsfw);
    }

    @ApiGetAnimeSearchByTitle()
    @Get('anime/search/:title')
    async searchAnime(
        @Param('title') title: string,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        const finalLimit = limit || 10;
        return this.kitsuApiService.searchAnime(title, finalLimit);
    }

    @Get('anime/:id')
    async getAnime(@Param('id', ParseIntPipe) id: number) {
        return this.kitsuApiService.getAnime(id);
    }
}