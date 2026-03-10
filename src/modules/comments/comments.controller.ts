import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CommentsDto } from './dtos/comments.dto';
import { Throttle } from '@nestjs/throttler';
import { User } from 'src/decorators/user.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Post a comment', description: 'Creates a top-level comment or a reply on an anime. Rate-limited to 3 requests per minute.' })
  @ApiBody({ type: CommentsDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @ApiResponse({ status: 429, description: 'Too many requests — rate limit exceeded.' })
  @Post()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async comment(@User('sub') userId: string, @Body() commentsDto: CommentsDto) {
    return this.commentsService.commitComment(userId, commentsDto);
  }

  @ApiOperation({ summary: 'Get comments for an anime', description: 'Returns all top-level comments for the given anime, including like status for the authenticated user.' })
  @ApiQuery({ name: 'animeId', description: 'Kitsu anime ID', example: 12345 })
  @ApiResponse({ status: 200, description: 'List of comments.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Get()
  async getComments(
    @User('sub') userId: string,
    @Query('animeId') animeId: number,
  ) {
    return this.commentsService.getCommentsByAnimeId(Number(animeId), userId);
  }

  @ApiOperation({ summary: 'Count replies for a comment', description: 'Returns the total number of direct replies for a given comment.' })
  @ApiQuery({ name: 'commentId', description: 'ID of the parent comment', example: 42 })
  @ApiResponse({ status: 200, description: 'Reply count.', schema: { properties: { count: { type: 'number', example: 7 } } } })
  @Get('count-replies')
  async getCountReplysOfComments(@Query('commentId') commentId: number) {
    return this.commentsService.getCountReplysOfComments(Number(commentId));
  }

  @ApiOperation({ summary: 'Get replies for a comment', description: 'Returns all direct replies to the specified comment.' })
  @ApiQuery({ name: 'commentId', description: 'ID of the parent comment', example: 42 })
  @ApiResponse({ status: 200, description: 'List of replies.' })
  @Get('replies')
  async getReplies(@Query('commentId') commentId: number) {
    return this.commentsService.getRepliesOfComment(Number(commentId));
  }

  @ApiOperation({ summary: 'Like or unlike a comment', description: 'Toggles the like state for a comment by the authenticated user.' })
  @ApiBody({ schema: { properties: { commentId: { type: 'number', example: 42, description: 'ID of the comment to like/unlike' } } } })
  @ApiResponse({ status: 200, description: 'Like state toggled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' })
  @Patch('like')
  async likeComment(
    @User('sub') userId: string,
    @Body('commentId') commentId: number,
  ) {
    return this.commentsService.likeComment(Number(commentId), userId);
  }

  @ApiOperation({ summary: 'Get like count for a comment', description: 'Returns the total number of likes for the given comment.' })
  @ApiQuery({ name: 'commentId', description: 'ID of the comment', example: 42 })
  @ApiResponse({ status: 200, description: 'Like count.', schema: { properties: { count: { type: 'number', example: 15 } } } })
  @ApiResponse({ status: 400, description: 'Invalid commentId — must be an integer.' })
  @Get('count-likes')
  async getLikesOfComments(
    @Query('commentId', new ParseIntPipe()) commentId: number,
  ) {
    return this.commentsService.getLikesByCommentId(commentId);
  }
}
