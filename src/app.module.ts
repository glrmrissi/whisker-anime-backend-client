import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApiModule } from './api/api.module';
import { KitsuApiController } from './api/kitsu-api.controller';
import { MulterModule } from '@nestjs/platform-express';
import { AuthGuard } from './guards/auth.guard';
import { APP_GUARD } from '@nestjs/core/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './shared/entities/UserEntity';
import { FavoritesAnimeEntity } from './shared/entities/FavoritesAnimeEntity';
import { UsersModule } from './modules/users/users.module';
import { NotifierModule } from './modules/notifier/notifier.module';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FavoritesAnimesModule } from './modules/favorites-animes/favorites-animes.module';
import { CronJobModule } from './modules/cron-jobs/cron-job.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CommentsEntity } from './shared/entities/CommentsEntity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [UserEntity, FavoritesAnimeEntity, CommentsEntity],
      //synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        }
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    AuthModule,
    ApiModule,
    UsersModule,
    NotifierModule,
    FavoritesAnimesModule,
    CronJobModule,
    CommentsModule
  ],
  controllers: [AppController, KitsuApiController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
