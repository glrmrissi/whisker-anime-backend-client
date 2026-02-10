import { Module } from '@nestjs/common';
import { FavoritesAnimesService } from './favorites-animes.service';
import { FavoritesAnimesController } from './favorites-animes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesAnimeEntity } from 'src/shared/entities/FavoritesAnime.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoritesAnimeEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '6h' },
    }),
  ],
  controllers: [FavoritesAnimesController],
  providers: [FavoritesAnimesService],
})
export class FavoritesAnimesModule { }
