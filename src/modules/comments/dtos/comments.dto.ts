import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CommentsDto {
    @IsNumber()
    animeId: number;

    @IsString()
    content: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    parentId?: number;
}