import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770938569015 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "lastUserAgent" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastIpAddress" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastUserAgent"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastIpAddress"`);
    }

}
