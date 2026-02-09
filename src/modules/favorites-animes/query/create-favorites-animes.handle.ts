import { IQueryHandler } from "@nestjs/cqrs";
import { InjectDataSource } from "@nestjs/typeorm";

export class FavoritesAnimesQuery {
  userId: number;
}

export class CreateFavoritesAnimesHandler implements IQueryHandler<FavoritesAnimesQuery> {
  constructor(
    @InjectDataSource()
    private readonly dataSource,
  ) { }

  async execute(query: FavoritesAnimesQuery): Promise<void> {
    const { userId } = query;
    await this.dataSource.manager.save('favorites_animes', { userId: userId }); 
  }
}
