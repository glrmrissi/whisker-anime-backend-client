import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/shared/entities/UserEntity';
import { Repository } from 'typeorm';
import sharp from 'sharp';
import fs from 'fs';
import { GetUserDto } from 'src/auth/querys/get-user.handler';
import { QueryBus } from '@nestjs/cqrs/dist/query-bus';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly queryBus: QueryBus
    ) { }

    async updateAvatar(userId: string, file: Buffer): Promise<Buffer> {
        if (!file || !Buffer.isBuffer(file)) {
            throw new BadRequestException('Invalid file input');
        }

        if (file.length === 0) {
            throw new BadRequestException('Empty file uploaded');
        }

        await this.getUserByUuid(userId);

        try {
            const resizedBuffer = await sharp(file)
                .resize(500, 500)
                .toFormat('jpeg')
                .toBuffer();

            await this.saveImageOnUploadFolder(resizedBuffer, userId);
            return resizedBuffer;
        } catch (error) {
            throw new BadRequestException('Failed to process image', error.message);
        }
    }

    private async saveImageOnUploadFolder(file: Buffer, userId: string) {
        try {

            if (!fs.existsSync('./uploads')) {
                fs.mkdirSync('./uploads');
            }
            await fs.promises.writeFile(`./uploads/user-profile-${userId}.jpeg`, file);

            await this.userRepository.update({ id: userId }, { avatarUrl: `uploads/user-profile-${userId}.jpeg` });
        }
        catch (error) {
            throw new BadRequestException('Failed to save image', error.message);
        }
    }

    private async getUserByUuid(userId: string): Promise<UserEntity> {
        const query = new GetUserDto();
        query.id = userId;
        return this.queryBus.execute(query);
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
            throw new BadRequestException('Failed to update bio', error.message);
        }
    }

    async getUserSessionUpdate(userId: string): Promise<UserEntity> {
        const user = await this.getUserByUuid(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
