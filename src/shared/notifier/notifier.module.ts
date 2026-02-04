import { Module } from "@nestjs/common";
import { NotifierService } from "./notifier.service";
import { BullModule } from "@nestjs/bullmq";

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'notifier-router-queue',
        }),
    ],
    providers: [NotifierService],
    exports: [NotifierService],
})

export class NotifierModule {}