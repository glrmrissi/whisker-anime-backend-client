import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Migration1771269003199 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "comments",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: 'animeId',
                        type: 'int',
                    },
                    {
                        name: 'userId',
                        type: 'uuid'
                    },
                    {
                        name: 'parentId',
                        type: 'int',
                        isNullable: true, 
                    },
                    {
                        name: 'content',
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: 'tags',
                        type: 'text',
                        isArray: true,
                        isNullable: true,
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
            'comments',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'comments',
            new TableForeignKey({
                name: 'FK_comments_parent',
                columnNames: ['parentId'],
                referencedTableName: 'comments', 
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('comments', 'FK_comments_parent');
        await queryRunner.dropTable('comments');
    }
}