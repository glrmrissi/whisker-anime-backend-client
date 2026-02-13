import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ClearIpService } from "./clearip.service";

@Injectable()
export class CronJobService {
    constructor(
        private readonly _clearIpService: ClearIpService
    ) {}
    private readonly logger = new Logger(CronJobService.name);

    @Cron('0 0 * * * *')
    handleCronJobClearIp() {
        this.logger.log('Executing cron job: Clear old IP addresses');
        this._clearIpService.clearOldIpAddresses();
    }

}