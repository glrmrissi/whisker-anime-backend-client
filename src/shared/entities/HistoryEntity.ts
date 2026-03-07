import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HistoryActionEnum } from '../enum/history-action.enum';

@Entity('history')
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  action: HistoryActionEnum;

  @Column({ nullable: true, type: 'int' })
  animeId: number | null;

  @Column({ nullable: true, type: 'int' })
  episodeId: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
