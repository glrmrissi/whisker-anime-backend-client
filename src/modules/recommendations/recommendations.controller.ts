import { Controller, Get } from '@nestjs/common';
import { RecommendationsService, RecommendedAnime } from './recommendations.service';
import { User } from 'src/decorators/user.decorator';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  getRecommendations(@User('sub') userId: string): Promise<RecommendedAnime[]> {
    return this.recommendationsService.getRecommendations(userId);
  }
}
