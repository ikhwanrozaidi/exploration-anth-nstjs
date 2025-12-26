import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentMethods1754294528148 implements MigrationInterface {
    name = 'AddPaymentMethods1754294528148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "merchant_category" ("id" SERIAL NOT NULL, "merchantId" integer NOT NULL, "categoryName" character varying NOT NULL, "categoryDescription" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_193eb59c92e574470923f86c469" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_detail" ADD "fullName" character varying`);
        await queryRunner.query(`ALTER TABLE "user_detail" ADD "vaccount" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "country" character varying`);
        await queryRunner.query(`ALTER TABLE "payment_provider" ADD "publicKey" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_provider" ADD CONSTRAINT "UQ_8da8861401dd79d6c3b4e627543" UNIQUE ("publicKey")`);
        await queryRunner.query(`ALTER TABLE "merchant" ADD "publicKey" integer NOT NULL`);
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
        await queryRunner.query(`ALTER TYPE "public"."payment_session_status_enum" RENAME TO "payment_session_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payment_session_status_enum" AS ENUM('initiate', 'invalid', 'pending', 'expired', 'success', 'passed', 'unpassed', 'failed', 'completed')`);
        await queryRunner.query(`ALTER TABLE "payment_session" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payment_session" ALTER COLUMN "status" TYPE "public"."payment_session_status_enum" USING "status"::"text"::"public"."payment_session_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payment_session" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."payment_session_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_session_status_enum_old" AS ENUM('pending', 'completed', 'failed', 'expired')`);
        await queryRunner.query(`ALTER TABLE "payment_session" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payment_session" ALTER COLUMN "status" TYPE "public"."payment_session_status_enum_old" USING "status"::"text"::"public"."payment_session_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payment_session" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."payment_session_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_session_status_enum_old" RENAME TO "payment_session_status_enum"`);
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
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum_old" RENAME TO "user_status_enum"`);
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
        await queryRunner.query(`ALTER TABLE "payment_provider" DROP CONSTRAINT "UQ_8da8861401dd79d6c3b4e627543"`);
        await queryRunner.query(`ALTER TABLE "payment_provider" DROP COLUMN "publicKey"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "user_detail" DROP COLUMN "vaccount"`);
        await queryRunner.query(`ALTER TABLE "user_detail" DROP COLUMN "fullName"`);
        await queryRunner.query(`DROP TABLE "merchant_category"`);
    }

}
