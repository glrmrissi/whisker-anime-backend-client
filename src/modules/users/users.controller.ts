import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { GetUserDto } from 'src/auth/querys/get-user.handler';
import { QueryBus } from '@nestjs/cqrs';
import type { Express } from 'express';
import type { Request } from 'express';

@Controller('users')
export class UsersController {

    constructor(
        private readonly userService: UsersService,
        private readonly queryBus: QueryBus
    ) { }

    @Post('upload-avatar')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        if(!req.cookies['user_id']) {
            throw new BadRequestException('User id must be provide on cookie')
        }        
        const resizedBuffer = await this.userService.updateAvatar(req.cookies['user_id'], file.buffer);
        return { message: 'Avatar updated successfully', avatar: resizedBuffer };
    }

    @Post('update-bio')
    @HttpCode(HttpStatus.OK)
    async updateBio(@Body('userId') userId: string, @Body('bio') bio: string) {
        return this.userService.updateBio(userId, bio);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getUser(@Req() req: Request) {
        const query = new GetUserDto();
        query.id = req.cookies['user_id'];
        return await this.queryBus.execute(query);
    }

    @Get('user-session')
    @HttpCode(HttpStatus.OK)
    getUserSession(@Req() req: Request) {
        const id = req.cookies['user_id']
        return this.userService.getUserSessionUpdate(id);
    }

    @Post('edit')
    async handlingEdit(@Req() req: Request) {
        const id = req.cookies['user_id']
        return "his.userService.handlingModifyUser(id)"
    }
}
