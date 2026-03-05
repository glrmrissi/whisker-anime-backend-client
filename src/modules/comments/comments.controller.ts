import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CommentsService } from './comments.service';
import { CommentsDto } from './dtos/comments.dto';
import { Throttle } from '@nestjs/throttler';
import { User } from 'src/decorators/user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async comment(@User('sub') userId: string, @Body() commentsDto: CommentsDto) {
    return this.commentsService.commitComment(userId, commentsDto);
  }

  @Get()
  async getComments(@User('sub') userId: string, @Query('animeId') animeId: number) {
    return this.commentsService.getCommentsByAnimeId(Number(animeId), userId);
  }

  @Get('count-replies')
  async getCountReplysOfComments(@Query('commentId') commentId: number) {
    return this.commentsService.getCountReplysOfComments(Number(commentId));
  }

  @Get('replies')
  async getReplies(@Query('commentId') commentId: number) {
    return this.commentsService.getRepliesOfComment(Number(commentId));
  }

  @Patch('like')
  async likeComment(@User('sub') userId: string, @Body('commentId') commentId: number) {
    return this.commentsService.likeComment(Number(commentId), userId);
  }

  @Get('count-likes')
  async getLikesOfComments(
    @Query('commentId', new ParseIntPipe()) commentId: number,
  ) {
    return this.commentsService.getLikesByCommentId(commentId);
  }
}
