import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/shared/UserEntity';
import { Repository } from 'typeorm';
import sharp from 'sharp';
import fs from 'fs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
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
                .resize(50, 50)
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
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return user;
    }

}
