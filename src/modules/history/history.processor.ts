import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, MoreThan, Repository } from 'typeorm';
import { HistoryEntity } from 'src/shared/entities/HistoryEntity';
import { HistoryActionEnum } from 'src/shared/enum/history-action.enum';

interface HistoryJobPayload {
  userId: string;
  action: HistoryActionEnum;
  animeId?: number;
  episodeId?: number;
}

const MAX_HISTORY = 100;
const DEDUP_MINUTES = 5;

@Processor('history-queue')
export class HistoryProcessor extends WorkerHost {
  constructor(
    @InjectRepository(HistoryEntity)
    private historyRepository: Repository<HistoryEntity>,
  ) {
    super();
  }

  async process(job: Job<HistoryJobPayload>): Promise<void> {
    const { userId, action, animeId, episodeId } = job.data;

    const since = new Date(Date.now() - DEDUP_MINUTES * 60 * 1000);
    const duplicate = await this.historyRepository.findOne({
      where: {
        userId,
        action,
        animeId: animeId ?? IsNull(),
        episodeId: episodeId ?? IsNull(),
        createdAt: MoreThan(since),
      },
    });
    if (duplicate) return;

    await this.historyRepository.insert({
      userId,
      action,
      animeId: animeId ?? null,
      episodeId: episodeId ?? null,
    });

    const count = await this.historyRepository.count({ where: { userId } });
    if (count > MAX_HISTORY) {
      const oldest = await this.historyRepository.find({
        where: { userId },
        order: { createdAt: 'ASC' },
        take: count - MAX_HISTORY,
        select: ['id'],
      });
      await this.historyRepository.delete({ id: In(oldest.map((h) => h.id)) });
    }
  }
}
