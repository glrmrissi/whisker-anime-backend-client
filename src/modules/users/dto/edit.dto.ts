import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EditValueRequestDto {
  @ApiProperty({ example: 'Anime fan since 2005', description: 'User biography text' })
  @IsString()
  bio: string;
}
