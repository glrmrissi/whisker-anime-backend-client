import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { User } from 'src/decorators/user.decorator';
import { HistoryEntity } from 'src/shared/entities/HistoryEntity';

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Get()
    getMyHistory(
        @User('sub') userId: string,
        @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    ): Promise<HistoryEntity[]> {
        const safePage = Math.min(Math.max(page, 1), 10);
        return this.historyService.getUserHistory(userId, safePage);
    }
}
