import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApiModule } from './api/api.module';
import { KitsuApiController } from './api/kitsu-api.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    ApiModule,
  ],
  controllers: [AppController, KitsuApiController],
  providers: [AppService],
})
export class AppModule {}
