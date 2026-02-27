import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CommentsEntity } from "src/shared/entities/CommentsEntity";
import { EntityManager } from "typeorm"
import { CommentsDto } from "./dtos/comments.dto";
import { QueryBus } from "@nestjs/cqrs";
import { GetUserDto } from "src/auth/querys/get-user.handler";

@Injectable()
export class CommentsService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly queryBus: QueryBus
    ) { }

    async commitComment(userId: string, commentsDto: CommentsDto) {
        return await this.entityManager.transaction(async (eM) => {
            try {
                const comment = eM.create(CommentsEntity, { userId, ...commentsDto });

                const savedComment = await eM.save(comment);

                return savedComment; 
            } catch (error) {
                throw new Error("Failed to save comment");
            }
        });
    }

    async getCommentsById(commentId: number) {
        try {
            return await this.entityManager.query(`
                    SELECT * FROM public.comments
                    WHERE "id" = $1 AND "deletedAt" IS NULL
                    `, [commentId])
        } catch (error) {
            throw new NotFoundException("Not found comments")
        }
    }

    async getCommentsByAnimeId(animeId: number) {
        try {
            return await this.entityManager.query(`
                SELECT * FROM comments
                    WHERE "animeId" = $1 AND "parentId" IS NULL AND "deletedAt" IS NULL
                `, [animeId])
        } catch (error) {
            throw new NotFoundException("Not found comments of this anime")
        }
    }

    async getCountReplysOfComments(commentId: number) {
        try {
            return await this.entityManager.query(`
                SELECT COUNT(*) as replies_count FROM comments
                    WHERE "parentId" = $1 AND "parentId" IS NOT NULL AND "deletedAt" IS NULL
                `, [commentId])
        } catch (error) {
            throw new NotFoundException("Not found replies of this comment")
        }
    }

    async getRepliesOfComment(commentId: number) {
        try {
            return await this.entityManager.query(`
            SELECT * FROM comments
            WHERE "parentId" = $1 AND "deletedAt" IS NULL
            `, [commentId])
        } catch (error) {
            throw new NotFoundException("Not found replies")
        }
    }

    async verifyIfExistCommentWithThisUserIdAndCommentId(
        userId: string,
        commentId: number
    ): Promise<boolean> {
        const db = await this.entityManager.query(`
        SELECT * FROM comment_user_likes
        WHERE "commentId" = $1 AND "userId" = $2
    `, [commentId, userId]);

        if (db.length > 0) {
            throw new ConflictException("You already gave a like on this comment");
        }

        return true;
    }

    async likeComment(commentId: number, userId: string) {
        await this.entityManager.transaction(async (eM) => {
            try {
                const query = new GetUserDto();
                query.id = userId;
                await this.queryBus.execute(query);

                await this.getCommentsById(commentId);

                await this.verifyIfExistCommentWithThisUserIdAndCommentId(userId, commentId);

                return await eM.query(`
                    INSERT INTO comment_user_likes ("commentId", "userId")
                    VALUES($1, $2)
                    `, [commentId, userId]);
            } catch (e) {
                throw new Error(e);
            }
        })
    }

    async getLikesByCommentId(commentId: number) {
        return await this.entityManager.query(`
            SELECT COUNT(*) as likes_count FROM comment_user_likes 
            WHERE "commentId" = $1;
            `, [commentId]);
    }
}