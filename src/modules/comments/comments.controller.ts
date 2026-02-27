import { Body, Controller, Get, ParseIntPipe, Patch, Post, Query, Req } from "@nestjs/common";
import type { Request } from 'express'
import { CommentsService } from "./comments.service";
import { CommentsDto } from "./dtos/comments.dto";
import { Throttle } from "@nestjs/throttler";

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
    ) {}

    @Post()
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async comment(@Req() req: Request, @Body() commentsDto: CommentsDto) {
        const userId = req.cookies['user_id'];
        return await this.commentsService.commitComment(String(userId), commentsDto);
    }

    @Get()
    async getComments(@Query('animeId') animeId: number) {
        return await this.commentsService.getCommentsByAnimeId(Number(animeId));
    }

    @Get('count-replies')
    async getCountReplysOfComments(@Query('commentId') commentId: number) {
        return await this.commentsService.getCountReplysOfComments(Number(commentId));
    }
    
    @Get('replies')
    async getReplies(@Query('commentId') commentId: number) {
        return await this.commentsService.getRepliesOfComment(Number(commentId));
    }

    @Patch('like')
    async likeComment(@Req() req: Request, @Body('commentId') commentId: number) {
        const userId = req.cookies['user_id'];
        await this.commentsService.likeComment(Number(commentId), userId);
    }

    @Get('count-likes')
    async getLikesOfComments(@Query('commentId', new ParseIntPipe()) commentId: number) {
        return await this.commentsService.getLikesByCommentId(commentId);
    }
}