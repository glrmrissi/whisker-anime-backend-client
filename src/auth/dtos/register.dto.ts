import { IsEmail, IsString, IsNotEmpty, MinLength, IsStrongPassword } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  username: string;

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
