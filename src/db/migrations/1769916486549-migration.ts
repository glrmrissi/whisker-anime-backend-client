import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class Migration1769916486549 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'avatarUrl',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'nickName',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'role',
                        type: 'varchar',
                        default: `'USER'`,
                    },
                    {
                        name: 'isAdmin',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'isDeleted',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            })
        );

        await queryRunner.createIndex('users',
            new TableIndex({
                name: 'IDX_USERS_NICKNAME',
                columnNames: ['nickName'],
            }),
        );

        await queryRunner.createIndex('users',
            new TableIndex({
                name: 'IDX_USERS_ROLE',
                columnNames: ['role'],
            }),
        );

        await queryRunner.createIndex('users',
            new TableIndex({
                name: 'IDX_USERS_ISDELETED',
                columnNames: ['isDeleted'],
            }),
        );

        await queryRunner.createIndex('users',
            new TableIndex({
                name: 'IDX_USERS_ISADMIN',
                columnNames: ['isAdmin'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
