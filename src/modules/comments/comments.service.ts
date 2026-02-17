import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CommentsEntity } from "src/shared/entities/CommentsEntity";
import { EntityManager } from "typeorm"
import { CommentsDto } from "./dtos/comments.dto";

@Injectable()
export class CommentsService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async commitComment(userId: string, commentsDto: CommentsDto) {
        await this.entityManager.transaction(async (eM) => {
            try {
                const comment = await eM.create(CommentsEntity, { userId, ...commentsDto })
                await eM.save(comment)
            } catch (error) {
                throw new Error("Failed to save comment")
            }
        })
    }

    async getComments(animeId: number) {
        await this.entityManager.transaction(async (eM) => {
            try {
                const res = await this.entityManager.query(`
                    SELECT * FROM comments
                    WHERE "animeId"  = ${animeId} AND "parentId" IS NULL AND "deletedAt" IS NULL
                    `)
                console.log(res)
            } catch (error) {
                throw new Error('Sem comentários')
            }
        });
    }

    async getRepliesOfComment(commentId: number) {
        await this.entityManager.transaction(async (eM) => {
            try {
                const res = await this.entityManager.query(`
                    SELECT * FROM comments
                    WHERE "parentId"  = ${commentId} AND "deletedAt" IS NULL
                    `)
                console.log(res)
            } catch (error) {
                throw new Error('Sem comentários')
            }
        });

    }
}