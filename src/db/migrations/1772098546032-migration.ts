import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Migration1772098546032 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "comment_user_likes",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: 'commentId',
                        type: 'int',
                    },
                    {
                        name: 'userId',
                        type: 'uuid'
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "deletedAt",
                        type: "timestamp",
                        isNullable: true,
                        default: null,
                    },
                ]
            })
        );

        await queryRunner.createForeignKey(
            'comment_user_likes',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'comment_user_likes',
            new TableForeignKey({
                name: 'FK_comments_user_likes',
                columnNames: ['commentId'],
                referencedTableName: 'comments', 
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('comment_user_likes', 'FK_comments_user_likes');
        await queryRunner.dropTable('comment_user_likes');
    }
}