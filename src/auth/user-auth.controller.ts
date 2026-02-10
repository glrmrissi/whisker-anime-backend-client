import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
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
    @Throttle({ default: { limit: 10, ttl: 60000, blockDuration: 30000 } })
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.userAuthService.login(loginDto);
        console.log('Setting cookies for login response');
        console.log('Access Token:', tokens.access_token);
        console.log('Refresh Token:', tokens.refresh_token);
        console.log(res)
        res.cookie('x_access_token', tokens.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 1800000,
        }); 
        res.cookie('x_refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 3600000,
        });
        return { message: 'Login successful' };
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