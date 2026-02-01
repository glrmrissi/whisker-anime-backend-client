import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dtos/register.dto";
import { Repository } from "typeorm";
import { UserEntity } from "src/shared/UserEntity";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";

type loginResponse = {
    access_token: string, 
    refresh_token: string
}

@Injectable()
export class UserAuthService {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ message: string }> {
        try {
            const password = registerDto.password;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = this.userRepository.create({ ...registerDto, password: hashedPassword });
            await this.userRepository.save(user);
            return { message: 'User registered successfully' };
        } catch (error) {
            throw new Error('Registration failed: ' + error.message);
        }
    }

    async login(loginDto: LoginDto): Promise<loginResponse> {
        try {
            const res = {
                refresh_token: await this.jwtService.signAsync(loginDto, { expiresIn: '1d' }),
                access_token: await this.jwtService.signAsync(loginDto),
            }
            console.log('Login response:', res);
            return res;
        } catch (error) {
            throw new UnauthorizedException('Login failed, maybe invalid credentials');
        }
    }

    async refreshToken(refresh_token: string): Promise<{ access_token: string }> {
        try {
            const payload = await this.jwtService.verifyAsync(refresh_token);
            const newAccessToken = await this.jwtService.signAsync({ username: payload.username });
            return { access_token: newAccessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async verifyUser(username: string, password: string): Promise<string> {
        await this.verifyIfUserExists(username);
        const user = username;
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }
        return user as string;
    }

    private async verifyIfUserExists(username: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { username } });
        return !!user;
    }

    private async verifyUserByToken(token: string): Promise<UserEntity> {
        const payload = await this.jwtService.verifyAsync(token);
        const user = await this.userRepository.findOne({ where: { username: payload.username } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }

    async verifyToken(token: string): Promise<any> {
        try {
            await this.verifyUserByToken(token);
            if(!token) {
                throw new UnauthorizedException('Token is required');
            }
            const res =await this.jwtService.decode(token);
            const username = res.username;
            const password = res.password;
            if(!username || !password) {
                throw new UnauthorizedException('Invalid token payload');
            }

            return res;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}