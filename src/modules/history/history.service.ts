import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryEntity } from 'src/shared/entities/HistoryEntity';

@Injectable()
export class HistoryService {
    constructor(
        @InjectRepository(HistoryEntity)
        private historyRepository: Repository<HistoryEntity>,
    ) { }

    getUserHistory(userId: string, page: number): Promise<HistoryEntity[]> {
        return this.historyRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 10,
            skip: (page - 1) * 10,
        });
    }
}
