import { Controller, Post} from '@nestjs/common';
import { FavoritesAnimesService } from './favorites-animes.service';

@Controller('favorites-animes')
export class FavoritesAnimesController {
  constructor(private readonly favoritesAnimesService: FavoritesAnimesService) {} 

  @Post()
  create() {
    return this.favoritesAnimesService.create();
  }
}
