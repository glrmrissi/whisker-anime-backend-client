import { Exclude } from 'class-transformer';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @Exclude()
    nickName: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @Exclude()
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @Exclude()
    password: string;
}
