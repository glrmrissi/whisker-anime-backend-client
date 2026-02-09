import { Exclude } from 'class-transformer';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @Exclude()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @Exclude()
  password: string;
}
