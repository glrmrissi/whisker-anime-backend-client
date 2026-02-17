import { Module } from "@nestjs/common";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentsEntity } from "src/shared/entities/CommentsEntity";

@Module({
    imports: [TypeOrmModule.forFeature([CommentsEntity])],
    controllers: [CommentsController],
    providers: [CommentsService]
})
export class CommentsModule {
    
}