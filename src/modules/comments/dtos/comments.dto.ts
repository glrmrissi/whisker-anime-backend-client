import { IsNumber, IsOptional, IsString } from "class-validator";

export class CommentsDto {
    @IsNumber()
    animeId: number;

    @IsString()
    content: string;

    @IsString()
    tags: string[];

    @IsOptional()
    parentId?: number;
}