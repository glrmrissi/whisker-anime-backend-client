import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CommentsDto {
  @ApiProperty({ example: 12345, description: 'ID of the anime being commented on' })
  @IsNumber()
  animeId: number;

  @ApiProperty({ example: 'This anime is amazing!', description: 'Comment text content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: ['action', 'epic'], description: 'Tags associated with the comment' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 42, description: 'Parent comment ID when posting a reply' })
  @IsOptional()
  parentId?: number;
}
