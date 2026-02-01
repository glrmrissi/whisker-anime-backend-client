import { applyDecorators } from "@nestjs/common";
import { ApiBadRequestResponse, ApiProperty } from "@nestjs/swagger";

export function ApiGetAnimeSearchByTitle() {
    return applyDecorators(
        ApiProperty({
            description: 'Search for anime by title',
            example: 'Naruto',
        }),
        ApiBadRequestResponse({ description: 'Bad Request - Invalid title parameter' }),
    );
}