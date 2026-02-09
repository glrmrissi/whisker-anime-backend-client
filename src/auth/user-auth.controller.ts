import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { UserAuthService } from "./user-auth.service";
import { LoginDto } from "./dtos/login.dto";
import { RegisterDto } from "./dtos/register.dto";
import { AuthGuard } from "src/guards/auth.guard";
import { Public } from "src/decorators/set-meta-data.decorator";
import { Throttle } from "@nestjs/throttler";

@Controller('user-auth')
export class UserAuthController {
    constructor(
        private readonly userAuthService: UserAuthService
    ) { }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('ping')
    ping() {
        return { message: 'pong' };
    }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.userAuthService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Throttle({default: {limit: 10, ttl:60000 , blockDuration: 30000}})
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.userAuthService.login(loginDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: { refresh_token: string }) {
        return this.userAuthService.refreshToken(refreshTokenDto.refresh_token);
    }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body('username') username: string) {
        await this.userAuthService.forgotPassword(username);
        return { message: 'Password reset link sent if email exists' };
    }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('new-password')
    async newPassword(@Body('username') username: string, @Body('newPassword') newPassword: string, @Body('code') code: string) {
        await this.userAuthService.newPassword(username, newPassword, code);
        return { message: 'Password updated successfully' };
    }


    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}