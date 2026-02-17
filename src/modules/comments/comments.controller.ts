import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from 'express'
import { CommentsService } from "./comments.service";
import { CommentsDto } from "./dtos/comments.dto";
import { GetUserDto } from "src/auth/querys/get-user.handler";

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
    ) {}

    @Post()
    async comment(@Req() req: Request, @Body() commentsDto: CommentsDto) {
        const query = new GetUserDto();
        const userId = req.cookies['user_id'];
        query.id = userId;

        await this.commentsService.commitComment(String(userId), commentsDto)
    }

    @Get('')
    async getComments(@Body() animeId: number) {
        await this.commentsService.getComments(Number(animeId))
    }

    @Get('replies')
    async getReplies(@Body() commentId: number) {
        await this.commentsService.getRepliesOfComment(Number(commentId))
    }
}