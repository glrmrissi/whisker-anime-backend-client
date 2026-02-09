import { Exclude } from 'class-transformer';
import { IsEmail, IsString, IsNotEmpty, MinLength, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  )
  password: string;
}
