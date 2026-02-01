import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

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
    @MinLength(1)
    password: string;
}
