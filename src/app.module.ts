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
import { UserEntity } from './shared/UserEntity';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [UserEntity],
      //synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    ApiModule,
    UsersModule,
  ],
  controllers: [AppController, KitsuApiController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }],
})
export class AppModule { }
