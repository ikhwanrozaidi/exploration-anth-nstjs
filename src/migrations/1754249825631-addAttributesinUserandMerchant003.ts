import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttributesinUserandMerchant0031754249825631 implements MigrationInterface {
    name = 'AddAttributesinUserandMerchant0031754249825631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_detail" ADD "fullName" character varying`);
        await queryRunner.query(`ALTER TABLE "user_detail" ADD "vaccount" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."tier_type" AS ENUM('basic', 'premium', 'diamond')`);
        await queryRunner.query(`ALTER TABLE "user_detail" ADD "tier" "public"."tier_type" NOT NULL DEFAULT 'basic'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "country" character varying`);
        
        // Step 1: Add column as nullable first
        await queryRunner.query(`ALTER TABLE "merchant" ADD "publicKey" integer`);
        
        // Step 2: Update existing rows with default values using merchantId
        await queryRunner.query(`UPDATE "merchant" SET "publicKey" = EXTRACT(EPOCH FROM NOW())::integer + "merchantId" WHERE "publicKey" IS NULL`);
        
        // Step 3: Make column NOT NULL
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "publicKey" SET NOT NULL`);
        
        await queryRunner.query(`ALTER TABLE "merchant" ADD CONSTRAINT "UQ_893c9bf44324b9a09880ced8083" UNIQUE ("publicKey")`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD "directCallbackUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD "withdrawalCallbackUrl" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum" RENAME TO "user_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum" USING "status"::"text"::"public"."user_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum" RENAME TO "merchant_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum" USING "status"::"text"::"public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum_old" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum_old" USING "status"::"text"::"public"."merchant_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum_old" RENAME TO "merchant_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum_old" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum_old" USING "status"::"text"::"public"."user_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "withdrawalCallbackUrl"`);
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "directCallbackUrl"`);
        await queryRunner.query(`ALTER TABLE "merchant" DROP CONSTRAINT "UQ_893c9bf44324b9a09880ced8083"`);
        await queryRunner.query(`ALTER TABLE "merchant" DROP COLUMN "publicKey"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "user_detail" DROP COLUMN "tier"`);
        await queryRunner.query(`DROP TYPE "public"."tier_type"`);
        await queryRunner.query(`ALTER TABLE "user_detail" DROP COLUMN "vaccount"`);
        await queryRunner.query(`ALTER TABLE "user_detail" DROP COLUMN "fullName"`);
    }
}