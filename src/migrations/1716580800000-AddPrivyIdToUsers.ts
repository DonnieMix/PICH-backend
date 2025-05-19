import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrivyIdToUsers1716580800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "privyId" character varying UNIQUE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "privyId"
    `);
  }
}
