import { Module } from '@nestjs/common';
import { KitsuApiService } from './kitsu-api.service';
import { KitsuApiController } from './kitsu-api.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [KitsuApiController],
  providers: [KitsuApiService],
  exports: [KitsuApiService],
})
export class ApiModule {}
