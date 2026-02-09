import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserEntity } from "src/shared/entities/UserEntity";
import { InjectDataSource } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";

export class GetUserDto {
  id: string;
}

@QueryHandler(GetUserDto)
export class GetUserHandler implements IQueryHandler<GetUserDto> {
    constructor(
        @InjectDataSource()
        private readonly dataSource,
    ) { }

    async execute(query: GetUserDto): Promise<UserEntity> {
        const user = await this.dataSource.manager.findOne(UserEntity,
            {
                where: {
                    id: query.id
                },
                relations: {}
            }
        );

        if(!user) {
            throw new Error('User not found');
        }

        return plainToClass(UserEntity, user);
    }
}