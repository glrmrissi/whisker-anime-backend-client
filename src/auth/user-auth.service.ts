import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dtos/register.dto";
import { Repository } from "typeorm";
import { UserEntity } from "src/shared/entities/UserEntity";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { NotifierService } from "src/shared/notifier/notifier.service";

type loginResponse = {
    access_token: string,
    refresh_token: string,
}

interface Notification {
    subject: string;
    message: string;
    recipient: string;
}

@Injectable()
export class UserAuthService {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private configService: ConfigService,
        private notifierService: NotifierService
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
        await this.userRepository.update({ id: user.id }, { lastLogin: new Date() });
        const access_token = await this.jwtService.signAsync({ username: user.username });
        const refresh_token = await this.jwtService.signAsync({ username: user.username });
        return {
            access_token,
            refresh_token,
        }
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

    async forgotPassword(username: string) {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const code = await this.generateCode(username);

        try {
            await this.userRepository.update({ id: user.id }, {
                verificationToken: code,
                tokenExpiry: new Date(Date.now() + 3600000)
            });
        } catch (error) {
            throw new BadRequestException('Failed to set verification token');
        }
    }

    async generateCode(username: string): Promise<string> {
        const user = await this.userRepository.findOne({ where: { username } });

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        if (!user?.username) {
            throw new BadRequestException('User not found');
        }

        if (user.username !== null) {
            this.notifierService.notify({
                subject: 'Password Reset Attempt',
                message: `A password reset attempt was made for your account. If this was not you, please secure your account immediately. But if this was you, please use the code ${code} to reset your password. This code will expire in 1 hour.`,
                recipient: user.username
            }, { adminEmails: true, clientEmail: user.username });
        }

        const hashedCode = await bcrypt.hash(code, 10);
        return hashedCode;
    }

    async newPassword(username: string, newPassword: string, code: string) {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const isCodeValid = await this.verifyCode(username, code);
        if (!isCodeValid) {
            throw new BadRequestException('Invalid or expired code');
        }
        const userId = user.id;
        const pepper = this.configService.get<string>('B_CRYPT_HASH_PEPPER');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword + pepper, salt);
        await this.userRepository.update({ id: userId }, { password: hashedPassword });
    }

    async verifyCode(username: string, code: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user || !user.verificationToken) {
            return false;
        }

        if (user.tokenExpiry && user.tokenExpiry < new Date()) {
            return false;
        }

        const isCodeValid = await bcrypt.compare(code, user.verificationToken);
        if (!isCodeValid) {
            return false;
        }

        return true;
    }
}