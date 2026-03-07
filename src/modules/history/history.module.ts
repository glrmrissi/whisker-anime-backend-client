import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { HistoryProcessor } from './history.processor';
import { HistoryInterceptor } from 'src/interceptors/history.interceptor';
import { HistoryEntity } from 'src/shared/entities/HistoryEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'history-queue' }),
        TypeOrmModule.forFeature([HistoryEntity]),
        AuthModule,
    ],
    controllers: [HistoryController],
    providers: [HistoryService, HistoryProcessor, HistoryInterceptor],
    exports: [HistoryInterceptor],
})
export class HistoryModule { }
