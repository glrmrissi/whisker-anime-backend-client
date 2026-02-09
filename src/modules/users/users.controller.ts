import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { UsersService } from './users.service';
import { GetUserDto } from 'src/auth/querys/get-user.handler';
import { QueryBus } from '@nestjs/cqrs';

@Controller('users')
export class UsersController {

    constructor(
        private readonly userService: UsersService,
        private readonly queryBus: QueryBus
    ) { }

    @Post('upload-avatar')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Body() body: { userId: string }) {
        const resizedBuffer = await this.userService.updateAvatar(body.userId, file.buffer);
        return { message: 'Avatar updated successfully', avatar: resizedBuffer };
    }

    @Post('update-bio')
    @HttpCode(HttpStatus.OK)
    async updateBio(@Body('userId') userId: string, @Body('bio') bio: string) {
        console.log('Updating bio for user:', userId);
        console.log('New bio:', bio);
        return this.userService.updateBio(userId, bio);
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    getUser(@Param('id') id: string) {
        const query = new GetUserDto();
        query.id = id;
        return this.queryBus.execute(query);
    }
}
