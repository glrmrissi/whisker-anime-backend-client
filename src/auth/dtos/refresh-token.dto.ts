import { Exclude } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @Exclude()
  refresh_token: string;
}
