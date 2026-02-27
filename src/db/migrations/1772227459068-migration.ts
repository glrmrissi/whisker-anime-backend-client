import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772227459068 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX idx_comments_parent_deleted ON comments("parentId") WHERE "deletedAt" IS NULL;
            `)
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        // Do nothing
    }

}
