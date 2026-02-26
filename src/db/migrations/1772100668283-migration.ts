import { MigrationInterface, QueryRunner, TableUnique } from "typeorm";

export class Migration1772100668283 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createUniqueConstraint(
            'comment_user_likes',
            new TableUnique({
                name: 'UQ_comment_user_likes',
                columnNames: ['commentId', 'userId'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropUniqueConstraint('comment_user_likes', 'UQ_comment_user_likes');
    }
}