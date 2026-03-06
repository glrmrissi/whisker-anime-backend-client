import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { FavoritesAnimesModule } from '../favorites-animes/favorites-animes.module';

@Module({
  imports: [FavoritesAnimesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
