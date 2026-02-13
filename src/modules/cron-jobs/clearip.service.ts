import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm/dist/common/typeorm.decorators";
import { UserEntity } from "src/shared/entities/UserEntity";
import { Repository } from "typeorm";

@Injectable()
export class ClearIpService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}
    private readonly logger = new Logger(ClearIpService.name);
    
    clearOldIpAddresses() {
        this.logger.log('Clearing old IP addresses from the database...');
        this.checkIfUserUpdatedInTheLastMonth()
            .then(hasActiveUsers => {
                if (!hasActiveUsers) {
                    this.userRepository.createQueryBuilder()
                        .update(UserEntity)
                        .set({ lastIpAddress: '', lastUserAgent: '' })
                        .execute()
                        .then(() => {
                            this.logger.log('Old IP addresses cleared successfully.');
                        })
                        .catch(error => {
                            this.logger.error('Failed to clear old IP addresses', error);
                        });
                } else {
                    this.logger.log('Active users found. Skipping IP address clearance.');
                }
            })
            .catch(error => {
                this.logger.error('Failed to check user activity', error);
            });
    }

    private async checkIfUserUpdatedInTheLastMonth(): Promise<boolean> {
        const users = await this.getAllUsers();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        if(users.length === 0) {
            this.logger.log('No users found in the database.');
            return false;
        }

        if(!users || users.length === 0) {
            this.logger.log('No users have a last login date. Assuming no active users.');
            return false;
        }

        const activeUsers = users.filter(user => user?.lastLogin && user.lastLogin > oneMonthAgo);
        return activeUsers.length > 0;
    }

    private async getAllUsers(): Promise<UserEntity[]> {
        try {
            return await this.userRepository.find();
        } catch (error) {
            this.logger.error('Failed to fetch users from the database', error);
            throw new NotFoundException('Failed to fetch users');
        }
    }
}