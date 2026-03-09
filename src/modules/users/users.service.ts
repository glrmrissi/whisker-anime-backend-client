import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/shared/entities/UserEntity';
import { EntityManager, Repository } from 'typeorm';
import sharp from 'sharp';
import fs from 'fs';
import { GetUserDto } from 'src/auth/querys/get-user.handler';
import { QueryBus } from '@nestjs/cqrs/dist/query-bus';
import { EditValueRequestDto } from './dto/edit.dto';

type AvatarAndName = { nickName: string; avatarUrl: string };
type AvatarOnly = { avatarUrl: string };

export type ProfileUpdateType = {
  bio: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly queryBus: QueryBus,
    private readonly entityManager: EntityManager,
  ) { }

  async updateAvatar(userId: string, file: Buffer): Promise<object> {
    if (!file || !Buffer.isBuffer(file)) {
      throw new BadRequestException('Invalid file input');
    }
    if (file.length === 0) {
      throw new BadRequestException('Empty file uploaded');
    }
    await this.getUserByUuid(userId);
    try {
      const resizedBuffer = await sharp(file)
        .resize(150, 150)
        .toFormat('webp')
        .toBuffer();
      return await this.saveImageOnUploadFolder(resizedBuffer, userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException('Failed to process image', message);
    }
  }

  private async saveImageOnUploadFolder(file: Buffer, userId: string) {
    try {
      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
      }
      await fs.promises.writeFile(
        `./uploads/user-profile-${userId}.webp`,
        file,
      );
      await this.userRepository.update(
        { id: userId },
        { avatarUrl: `uploads/user-profile-${userId}.webp` },
      );
      return { avatarUrl: `uploads/user-profile-${userId}.webp` };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException('Failed to save image', message);
    }
  }

  private async getUserByUuid(userId: string): Promise<UserEntity> {
    const query = new GetUserDto();
    query.id = userId;
    return this.queryBus.execute<GetUserDto, UserEntity>(query);
  }

  async updateBio(userId: string, bio: string): Promise<{ message: string }> {
    await this.getUserByUuid(userId);
    try {
      if (bio === undefined) {
        await this.userRepository.update({ id: userId }, { bio: null });
      }
      if (userId === undefined) {
        throw new BadRequestException('User ID is required');
      }
      if (userId !== undefined && bio !== undefined) {
        await this.userRepository.update({ id: userId }, { bio });
      }
      return { message: 'Bio updated successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException('Failed to update bio', message);
    }
  }

  async getUserSessionUpdate(userId: string): Promise<UserEntity> {
    const user = await this.getUserByUuid(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async handlingModifyUser(userId: string, body: EditValueRequestDto): Promise<{ message: string }> {
    await this.getUserByUuid(userId);

    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== null && value !== undefined)
    );

    try {
      await this.userRepository.update({ id: userId }, updateData);

      return { message: "Updated profile successfully" };
    } catch {
      throw new Error('Error updating user profile');
    }
  }
  async getAvatarAndName(userId: string): Promise<AvatarAndName[]> {
    return this.entityManager.query<AvatarAndName[]>(
      `
      SELECT "nickName", "avatarUrl" FROM public.users
      WHERE "id" = $1 AND "deletedAt" IS NULL
      `,
      [userId],
    );
  }

  async getAvatar(userId: string): Promise<AvatarOnly[]> {
    return this.entityManager.query<AvatarOnly[]>(
      `
      SELECT "avatarUrl" FROM public.users
      WHERE "id" = $1 AND "deletedAt" IS NULL
      `,
      [userId],
    );
  }
}
