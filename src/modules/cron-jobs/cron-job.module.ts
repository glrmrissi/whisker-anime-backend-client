import { Module } from "@nestjs/common";
import { ClearIpService } from "./clearip.service";
import { Cron, ScheduleModule } from "@nestjs/schedule";
import { CronJobService } from "./cron-job.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/shared/entities/UserEntity";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        ScheduleModule.forRoot()
    ],
    providers: [CronJobService, ClearIpService],
    exports: [CronJobService, ClearIpService],
})
export class CronJobModule { }