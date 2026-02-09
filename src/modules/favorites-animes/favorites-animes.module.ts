import { Module } from '@nestjs/common';
import { FavoritesAnimesService } from './favorites-animes.service';
import { FavoritesAnimesController } from './favorites-animes.controller';

@Module({
  controllers: [FavoritesAnimesController],
  providers: [FavoritesAnimesService],
})
export class FavoritesAnimesModule {}
