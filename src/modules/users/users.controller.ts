import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { GetUserDto } from 'src/auth/querys/get-user.handler';
import { QueryBus } from '@nestjs/cqrs';
import type { Express, Request } from 'express';
import { UserEntity } from 'src/shared/entities/UserEntity';
import { RolesEnum } from 'src/shared/enum/roles.enum';
import { IsOwnerCheck } from 'src/decorators/ckeck-owner.decorator';
import { User } from 'src/decorators/user.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly queryBus: QueryBus,
  ) { }

  @Get('me') 
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@User('sub') userId: string) {
    const query = new GetUserDto();
    query.id = userId;
    return this.queryBus.execute(query);
  }

  @Post('upload-avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req.cookies['user_id'] as string | undefined;
    if (!userId) {
      throw new BadRequestException('User id must be provide on cookie');
    }
    return this.userService.updateAvatar(userId, file.buffer);
  }

  @Post('update-bio')
  @HttpCode(HttpStatus.OK)
  async updateBio(@Body('userId') userId: string, @Body('bio') bio: string) {
    return this.userService.updateBio(userId, bio);
  }

  @Get('user-session')
  @HttpCode(HttpStatus.OK)
  getUserSession(@Req() req: Request): Promise<UserEntity> {
    const id = (req.cookies['user_id'] as string | undefined) ?? '';
    return this.userService.getUserSessionUpdate(id);
  }

  @Get('avatar-name')
  @HttpCode(HttpStatus.OK)
  async getAvatarAndName(@Query('userId') userId: string) {
    return this.userService.getAvatarAndName(userId);
  }

  @Get('avatar')
  @HttpCode(HttpStatus.OK)
  async getAvatar(@Req() req: Request) {
    const id = (req.cookies['user_id'] as string | undefined) ?? '';
    return this.userService.getAvatar(id);
  }

  @Post('edit')
  @IsOwnerCheck()
  handlingEdit(@Req() req: Request): Promise<void> {
    const id = (req.cookies['user_id'] as string | undefined) ?? '';
    return this.userService.handlingModifyUser(id);
  }

  @Get(':id')
  @Roles(RolesEnum.OWNER, RolesEnum.ADMIN_MASTER)
  @IsOwnerCheck()
  @HttpCode(HttpStatus.OK)
  async getUser(@User('sub') userId: string): Promise<UserEntity> {
    const query = new GetUserDto();
    query.id = userId;
    return this.queryBus.execute<GetUserDto, UserEntity>(query);
  }
}
