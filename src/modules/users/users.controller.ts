import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { UsersService } from './users.service';
import { Public } from 'src/decorators/set-meta-data.decorator';

@Controller('users')
export class UsersController {

    constructor(
        private readonly userService: UsersService
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
    async updateBio(@Body('userId') userId: string, @Body('bio') bio: string ) {
        console.log('Updating bio for user:', userId);
        console.log('New bio:', bio);
        return this.userService.updateBio(userId, bio);
    }
}
