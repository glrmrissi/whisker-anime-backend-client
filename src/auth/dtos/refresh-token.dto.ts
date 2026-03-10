import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token issued during login' })
  @IsNotEmpty()
  @IsString()
  @Exclude()
  refresh_token: string;
}
