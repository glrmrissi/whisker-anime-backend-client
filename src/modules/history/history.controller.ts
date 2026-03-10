import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { User } from 'src/decorators/user.decorator';
import { HistoryEntity } from 'src/shared/entities/HistoryEntity';

@ApiTags('History')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @ApiOperation({
    summary: 'Get watch history',
    description: 'Returns the authenticated user\'s anime watch history, paginated. Page is clamped between 1 and 10.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1–10)', example: 1 })
  @ApiResponse({ status: 200, description: 'Paginated watch history.', type: [HistoryEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get()
  getMyHistory(
    @User('sub') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ): Promise<HistoryEntity[]> {
    const safePage = Math.min(Math.max(page, 1), 10);
    return this.historyService.getUserHistory(userId, safePage);
  }
}
