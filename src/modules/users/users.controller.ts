import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { GetUserDto } from 'src/auth/querys/get-user.handler';
import { QueryBus } from '@nestjs/cqrs';
import type { Express } from 'express';
import { UserEntity } from 'src/shared/entities/UserEntity';
import { RolesEnum } from 'src/shared/enum/roles.enum';
import { IsOwnerCheck } from 'src/decorators/ckeck-owner.decorator';
import { User } from 'src/decorators/user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { EditValueRequestDto } from './dto/edit.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Get my profile', description: 'Returns the full profile of the currently authenticated user.' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile.', type: UserEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@User('sub') userId: string): Promise<UserEntity> {
    const query = new GetUserDto();
    query.id = userId;
    return this.queryBus.execute<GetUserDto, UserEntity>(query);
  }

  @ApiOperation({ summary: 'Upload avatar', description: 'Uploads and replaces the authenticated user\'s profile picture. Accepts a multipart/form-data file under the `file` field.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary', description: 'Avatar image file' } } } })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully.' })
  @ApiResponse({ status: 400, description: 'Missing user ID in cookie.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Post('upload-avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @User('sub') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('User id must be provide on cookie');
    }
    return this.userService.updateAvatar(userId, file.buffer);
  }

  @ApiOperation({ summary: 'Update user bio', description: 'Updates the biography text for the specified user.' })
  @ApiBody({ schema: { required: ['userId', 'bio'], properties: { userId: { type: 'string', description: 'User ID' }, bio: { type: 'string', example: 'Anime fan since 2005' } } } })
  @ApiResponse({ status: 200, description: 'Bio updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Post('update-bio')
  @HttpCode(HttpStatus.OK)
  async updateBio(@Body('userId') userId: string, @Body('bio') bio: string) {
    return this.userService.updateBio(userId, bio);
  }

  @ApiOperation({ summary: 'Get user session data', description: 'Returns up-to-date session information for the authenticated user, used to refresh client-side state.' })
  @ApiResponse({ status: 200, description: 'Session user data.', type: UserEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get('user-session')
  @HttpCode(HttpStatus.OK)
  getUserSession(@User('sub') userId: string): Promise<UserEntity> {
    return this.userService.getUserSessionUpdate(userId);
  }

  @ApiOperation({ summary: 'Get avatar and display name by user ID', description: 'Fetches only the avatar URL and nickname for a given user. Public-facing endpoint used for lightweight user card rendering.' })
  @ApiQuery({ name: 'userId', description: 'Target user ID', example: 'uuid-here' })
  @ApiResponse({ status: 200, description: 'Avatar URL and display name.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get('avatar-name')
  @HttpCode(HttpStatus.OK)
  async getAvatarAndName(@Query('userId') userId: string) {
    return this.userService.getAvatarAndName(userId);
  }

  @ApiOperation({ summary: 'Get my avatar', description: 'Returns the avatar URL for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Avatar URL.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get('avatar')
  @HttpCode(HttpStatus.OK)
  async getAvatar(@User('sub') userId: string) {
    return this.userService.getAvatar(userId);
  }

  @ApiOperation({ summary: 'Edit user profile fields', description: 'Patches one or more editable fields on the authenticated user profile (e.g. bio).' })
  @ApiBody({ type: EditValueRequestDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.', schema: { properties: { message: { type: 'string', example: 'Profile updated' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Patch('edit')
  handlingEdit(@User('sub') userId: string, @Body('body') body: EditValueRequestDto): Promise<{ message: string }> {
    return this.userService.handlingModifyUser(userId, body);
  }

  @ApiOperation({ summary: 'Get user by ID (admin/owner only)', description: 'Retrieves a full user profile by ID. Restricted to users with OWNER or ADMIN_MASTER roles.' })
  @ApiResponse({ status: 200, description: 'User profile.', type: UserEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role.' })
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
