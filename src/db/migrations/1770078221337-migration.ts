import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770078221337 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "bio" text,
            ADD COLUMN "isEmailVerified" boolean NOT NULL DEFAULT false,
            ADD COLUMN "verificationToken" varchar(255),
            ADD COLUMN "tokenExpiry" TIMESTAMP,
            ADD COLUMN "lastLogin" TIMESTAMP,
            ADD COLUMN "profileVisibility" varchar(50) DEFAULT 'public',
            ADD COLUMN "twoFactorEnabled" boolean NOT NULL DEFAULT false,
            ADD COLUMN "preferredLanguage" varchar(10) DEFAULT 'en';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "bio",
            DROP COLUMN "isEmailVerified",
            DROP COLUMN "verificationToken",
            DROP COLUMN "tokenExpiry",
            DROP COLUMN "lastLogin",
            DROP COLUMN "profileVisibility",
            DROP COLUMN "twoFactorEnabled",
            DROP COLUMN "preferredLanguage";
        `);
    }

}
