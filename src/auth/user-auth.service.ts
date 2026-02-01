import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dtos/register.dto";
import { Repository } from "typeorm";
import { UserEntity } from "src/shared/UserEntity";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config/dist/config.service";

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
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ message: string }> {
        try {
            const pepper = this.configService.get<string>('B_CRYPT_HASH_PEPPER');

            const userExists = await this.verifyIfUserExists(registerDto.username);
            if (userExists) {
                throw new BadRequestException('Username already taken');
            }

            const nickNameExists = await this.verifyIfNickNameExists(registerDto.nickName);
            if (nickNameExists) {
                throw new BadRequestException('NickName already taken');
            }

            const password = registerDto.password;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password + pepper, salt);

            const user = this.userRepository.create({ ...registerDto, password: hashedPassword });
            await this.userRepository.save(user);
            return { message: 'User registered successfully' };
        } catch (error) {
            throw new Error('Registration failed: ' + error.message);
        }
    }

    async login(loginDto: LoginDto): Promise<loginResponse> {
        try {
            if (loginDto.username === undefined || loginDto.password === undefined) {
                throw new BadRequestException('Username and password are required');
            }

            if (!loginDto.username || !loginDto.password) {
                throw new BadRequestException('Username and password cannot be empty');
            }

            return await this.verifyUser(loginDto.username, loginDto.password);

        } catch (error) {
            throw new UnauthorizedException('Login failed, maybe invalid credentials');
        }
    }

    async refreshToken(refresh_token: string): Promise<{ access_token: string }> {
        try {
            await this.verifyToken(refresh_token);
            const payload = await this.jwtService.verifyAsync(refresh_token);
            const newAccessToken = await this.jwtService.signAsync({ username: payload.username });
            return { access_token: newAccessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async verifyUser(username: string, password: string): Promise<loginResponse> {
        await this.verifyIfUserExists(username);
        const pepper = this.configService.get<string>('B_CRYPT_HASH_PEPPER');
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        
        const isPasswordValid = await bcrypt.compare(password + pepper, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }
        const access_token = await this.jwtService.signAsync({ username: user.username });
        const refresh_token = await this.jwtService.signAsync({ username: user.username });
        return { access_token, refresh_token };
    }

    private async verifyIfUserExists(username: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { username } });
        return !!user;
    }

    private async verifyIfNickNameExists(nickName: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { nickName } });
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
            if (!token) {
                throw new UnauthorizedException('Token is required');
            }
            await this.verifyUserByToken(token);
            const res = await this.jwtService.decode(token);
            const username = res.username;
            const password = res.password;
            if (!username || !password) {
                throw new UnauthorizedException('Invalid token payload');
            }

            return res;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}