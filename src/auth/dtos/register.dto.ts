import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'AnimeGuru', description: 'Display nickname shown on the user profile' })
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email address used as login username' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  username: string;

  @ApiProperty({ example: 'P@ssw0rd!', description: 'Strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)' })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
