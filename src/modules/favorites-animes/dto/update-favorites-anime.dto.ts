import { PartialType } from '@nestjs/swagger';
import { CreateFavoritesAnimeDto } from './create-favorites-anime.dto';

export class UpdateFavoritesAnimeDto extends PartialType(CreateFavoritesAnimeDto) {}
