import { Body, Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { KitsuApiService } from "./kitsu-api.service";

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
        console.log('[KITSU API CONTROLLER] Fetching trending anime with limit:', finalLimit);
        return this.kitsuApiService.getTrendingAnime(finalLimit);
    }

    @Get('anime/:id')
    async getAnime(@Param('id', ParseIntPipe) id: number) {
        console.log('[KITSU API CONTROLLER] Fetching anime with ID:', id);
        return this.kitsuApiService.getAnime(id);
    }

    @Get('anime/search/:title')
    async searchAnime(
        @Param('title') title: string,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        const finalLimit = limit || 10;
        console.log('[KITSU API CONTROLLER] Searching anime:', title, 'with limit:', finalLimit);
        return this.kitsuApiService.searchAnime(title, finalLimit);
    }
}