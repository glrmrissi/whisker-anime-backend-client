import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CommentsEntity } from 'src/shared/entities/CommentsEntity';
import { EntityManager } from 'typeorm';
import { CommentsDto } from './dtos/comments.dto';

type CommentRow = Record<string, unknown>;
type LikeRow = { id: number };
type LikeCount = { likes_count: string };
type ReplyCount = { replies_count: string };
type ActionResult = { action: 'liked' | 'unliked' };

@Injectable()
export class CommentsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async commitComment(
    userId: string,
    commentsDto: CommentsDto,
  ): Promise<CommentsEntity> {
    return this.entityManager.transaction(async (eM) => {
      try {
        const comment = eM.create(CommentsEntity, { userId, ...commentsDto });
        return await eM.save(comment);
      } catch {
        throw new Error('Failed to save comment');
      }
    });
  }

  async getCommentsById(commentId: number): Promise<CommentRow[]> {
    try {
      return await this.entityManager.query<CommentRow[]>(
        `
        SELECT * FROM public.comments
        WHERE "id" = $1 AND "deletedAt" IS NULL
        `,
        [commentId],
      );
    } catch {
      throw new NotFoundException('Not found comments');
    }
  }

  async getCommentsByAnimeId(
    animeId: number,
    userId: string,
  ): Promise<CommentRow[]> {
    return this.entityManager.query<CommentRow[]>(
      `
      SELECT c.*, 
      (SELECT COUNT(*) FROM comments r WHERE r."parentId" = c.id AND r."deletedAt" IS NULL) as "replyCount",
      (SELECT COUNT(*) FROM comment_user_likes cul WHERE cul."commentId" = c.id) as "likeCount",
      EXISTS (
          SELECT 1 FROM comment_user_likes cul 
          WHERE cul."commentId" = c.id AND cul."userId" = $2
      ) as "isLiked"
      FROM comments c
      WHERE c."animeId" = $1 AND c."parentId" IS NULL AND c."deletedAt" IS NULL
      `,
      [animeId, userId],
    );
  }

  async getCountReplysOfComments(commentId: number): Promise<ReplyCount[]> {
    try {
      return await this.entityManager.query<ReplyCount[]>(
        `
        SELECT COUNT(*) as replies_count FROM comments
        WHERE "parentId" = $1 AND "parentId" IS NOT NULL AND "deletedAt" IS NULL
        `,
        [commentId],
      );
    } catch {
      throw new NotFoundException('Not found replies of this comment');
    }
  }

  async getRepliesOfComment(commentId: number): Promise<CommentRow[]> {
    try {
      return await this.entityManager.query<CommentRow[]>(
        `
        SELECT * FROM comments
        WHERE "parentId" = $1 AND "deletedAt" IS NULL
        `,
        [commentId],
      );
    } catch {
      throw new NotFoundException('Not found replies');
    }
  }

  async verifyIfExistCommentWithThisUserIdAndCommentId(
    userId: string,
    commentId: number,
  ): Promise<boolean> {
    const db = await this.entityManager.query<LikeRow[]>(
      `
      SELECT * FROM comment_user_likes
      WHERE "commentId" = $1 AND "userId" = $2
      `,
      [commentId, userId],
    );

    if (db.length > 0) {
      throw new ConflictException('You already gave a like on this comment');
    }

    return true;
  }

  async likeComment(commentId: number, userId: string): Promise<ActionResult> {
    return this.entityManager.transaction(async (eM) => {
      const existingLike = await eM.query<LikeRow[]>(
        `
        SELECT id FROM comment_user_likes 
        WHERE "userId" = $1 AND "commentId" = $2
        `,
        [userId, commentId],
      );

      if (existingLike.length > 0) {
        await eM.query(
          `
          DELETE FROM comment_user_likes 
          WHERE "userId" = $1 AND "commentId" = $2
          `,
          [userId, commentId],
        );
        return { action: 'unliked' as const };
      }

      try {
        await eM.query(
          `
          INSERT INTO comment_user_likes ("commentId", "userId")
          VALUES($1, $2)
          `,
          [commentId, userId],
        );
        return { action: 'liked' as const };
      } catch {
        throw new Error('Erro ao inserir like');
      }
    });
  }

  async getLikesByCommentId(commentId: number): Promise<LikeCount[]> {
    return this.entityManager.query<LikeCount[]>(
      `
      SELECT COUNT(*) as likes_count FROM comment_user_likes 
      WHERE "commentId" = $1;
      `,
      [commentId],
    );
  }
}
