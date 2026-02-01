import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { UserAuthService } from "./user-auth.service";
import { LoginDto } from "./dtos/login.dto";
import { RegisterDto } from "./dtos/register.dto";
import { AuthGuard } from "src/guards/auth.guard";
import { Public } from "src/decorators/set-meta-data.decorator";

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
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.userAuthService.login(loginDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: { refresh_token: string }) {
        return this.userAuthService.refreshToken(refreshTokenDto.refresh_token);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }

}