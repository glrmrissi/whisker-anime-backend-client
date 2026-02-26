import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from "@nestjs/common";
import type { Request } from 'express'
import { CommentsService } from "./comments.service";
import { CommentsDto } from "./dtos/comments.dto";
import { Public } from "src/decorators/set-meta-data.decorator";

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
    ) {}

    @Post()
    async comment(@Req() req: Request, @Body() commentsDto: CommentsDto) {
        const userId = req.cookies['user_id'];
        await this.commentsService.commitComment(String(userId), commentsDto);
    }

    @Get()
    async getComments(@Body() animeId: number) {
        await this.commentsService.getCommentsByAnimeId(Number(animeId));
    }

    @Get('replies')
    async getReplies(@Body('commentId') commentId: number) {
        await this.commentsService.getRepliesOfComment(Number(commentId));
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