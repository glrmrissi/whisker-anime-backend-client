import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RecommendationsService, RecommendedAnime } from './recommendations.service';
import { User } from 'src/decorators/user.decorator';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @ApiOperation({
    summary: 'Get personalized anime recommendations',
    description: 'Returns a list of anime recommendations tailored to the authenticated user based on their favorites and watch history.',
  })
  @ApiResponse({ status: 200, description: 'List of recommended animes.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get()
  getRecommendations(@User('sub') userId: string): Promise<RecommendedAnime[]> {
    return this.recommendationsService.getRecommendations(userId);
  }
}
