import { IQueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class FavoritesAnimesQuery {
  userId: number;
}

export class CreateFavoritesAnimesHandler implements IQueryHandler<FavoritesAnimesQuery> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(query: FavoritesAnimesQuery): Promise<object> {
    const { userId } = query;
    return this.dataSource.manager.save('favorites_animes', {
      userId: userId,
    });
  }
}
