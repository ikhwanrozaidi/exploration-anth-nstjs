import { MigrationInterface, QueryRunner } from "typeorm";

export class YourMigrationName1752824436924 implements MigrationInterface {
    name = 'YourMigrationName1752824436924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_detail" ("userId" integer NOT NULL, "firstName" character varying, "lastName" character varying, "address" character varying, "birthDate" date, "profilePicture" character varying, "gatePoint" integer NOT NULL DEFAULT '0', "verify" boolean NOT NULL DEFAULT false, "deletedAt" TIMESTAMP, CONSTRAINT "PK_455dfebe9344ffecf1c8e8e054d" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "user_settings" ("userId" integer NOT NULL, "marketing" boolean NOT NULL DEFAULT true, "notifications" boolean NOT NULL DEFAULT true, "twoFA" boolean NOT NULL DEFAULT false, "deletedAt" TIMESTAMP, CONSTRAINT "PK_986a2b6d3c05eb4091bb8066f78" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "merchantId" integer, "phone" character varying, "status" "public"."user_status_enum" NOT NULL DEFAULT 'active', "balance" numeric(10,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "registeredAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "referralCode" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."provider_status_enum" AS ENUM('active', 'inactive', 'maintenance')`);
        await queryRunner.query(`CREATE TABLE "payment_provider" ("providerId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "status" "public"."provider_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiryDate" date NOT NULL, "deletedAt" TIMESTAMP, CONSTRAINT "PK_0c2279a630c3cee6f72f858a3b9" PRIMARY KEY ("providerId"))`);
        await queryRunner.query(`CREATE TABLE "merchant_detail" ("merchantId" integer NOT NULL, "founderName" character varying NOT NULL, "founderPhone" character varying NOT NULL, "businessAddress" character varying NOT NULL, "ssmNumber" character varying NOT NULL, "picName" character varying NOT NULL, "picNumber" character varying NOT NULL, "bankName" character varying NOT NULL, "bankNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_6a2621ec0b9817d24902a6db360" PRIMARY KEY ("merchantId"))`);
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`CREATE TABLE "merchant" ("merchantId" SERIAL NOT NULL, "apiKey" character varying NOT NULL, "secretKey" character varying NOT NULL, "callbackUrl" character varying, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "category" integer NOT NULL, "status" "public"."merchant_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_933a1202351c04ff60a492e2ca8" PRIMARY KEY ("merchantId"))`);
        await queryRunner.query(`CREATE TABLE "payment_details" ("paymentId" uuid NOT NULL, "signature" character varying NOT NULL, "productName" character varying NOT NULL, "productDesc" character varying, "productCat" character varying, "amount" numeric(10,2) NOT NULL, "buyerName" character varying NOT NULL, "buyerEmail" character varying NOT NULL, "buyerPhone" character varying, "refundable" boolean, CONSTRAINT "PK_314335aaaa5c6df8614559f9aec" PRIMARY KEY ("paymentId"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_type_enum" AS ENUM('gateway', 'p2p')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status" AS ENUM('fail', 'success', 'pending', 'report', 'refund', 'cancelled', 'newer')`);
        await queryRunner.query(`CREATE TABLE "payment" ("paymentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "paymentType" "public"."payment_type_enum" NOT NULL, "receiverId" integer, "senderId" integer NOT NULL, "merchantId" integer, "amount" numeric(10,2) NOT NULL, "isRequest" boolean NOT NULL DEFAULT false, "status" "public"."payment_status" NOT NULL DEFAULT 'pending', "providerId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ipAddress" character varying, CONSTRAINT "PK_67ee4523b649947b6a7954dc673" PRIMARY KEY ("paymentId"))`);
        await queryRunner.query(`CREATE TYPE "public"."redirect_status_enum" AS ENUM('success', 'failed', 'pending', 'timeout', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_audit_status_enum" AS ENUM('fail', 'success', 'pending', 'report', 'refund', 'cancelled', 'newer')`);
        await queryRunner.query(`CREATE TYPE "public"."provider_status_audit" AS ENUM('active', 'inactive', 'maintenance')`);
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "paymentId" character varying NOT NULL, "initiatorId" character varying NOT NULL, "redirectStatus" "public"."redirect_status_enum" NOT NULL, "status" "public"."payment_audit_status_enum" NOT NULL DEFAULT 'pending', "payload" json, "providerId" character varying NOT NULL, "providerStatus" "public"."provider_status_audit" NOT NULL, "providerCallback" character varying, "providerPaymentId" character varying, "ipAddress" character varying, "deviceInfo" character varying, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_order_status_enum" AS ENUM('fail', 'success', 'pending', 'report', 'refund', 'cancelled', 'newer')`);
        await queryRunner.query(`CREATE TABLE "payment_orders" ("id" SERIAL NOT NULL, "orderId" character varying NOT NULL, "merchantId" integer NOT NULL, "status" "public"."payment_order_status_enum" NOT NULL DEFAULT 'pending', "amount" numeric(10,2) NOT NULL, "paymentId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_158dd178010c39759305293a149" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c6db1f43c150372d3636ef3d3e" ON "payment_orders" ("orderId", "merchantId") `);
        await queryRunner.query(`CREATE TYPE "public"."merchant_audit_status_enum" AS ENUM('success', 'failed', 'pending')`);
        await queryRunner.query(`CREATE TABLE "merchant_audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "merchantId" integer NOT NULL, "paymentId" character varying NOT NULL, "payload" json, "status" "public"."merchant_audit_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "PK_f027d4ed598425b1304e1fd910e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_session_status_enum" AS ENUM('pending', 'completed', 'failed', 'expired')`);
        await queryRunner.query(`CREATE TABLE "payment_session" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "merchantId" integer NOT NULL, "paymentPayload" text NOT NULL, "status" "public"."payment_session_status_enum" NOT NULL DEFAULT 'pending', "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "originalSessionId" integer, CONSTRAINT "UQ_263fa45386126efc2c4933adafe" UNIQUE ("token"), CONSTRAINT "PK_a1a91b20f7f3b1e5afb5485cbcd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "merchant_category" ("id" SERIAL NOT NULL, "merchantId" integer NOT NULL, "categoryName" character varying NOT NULL, "categoryDescription" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_193eb59c92e574470923f86c469" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_trail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "action" character varying NOT NULL, "ipAddress" character varying, "deviceInfo" character varying, CONSTRAINT "PK_91aade8e45ada93f7dc98ca7ced" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_detail" ADD CONSTRAINT "FK_455dfebe9344ffecf1c8e8e054d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "merchant_detail" ADD CONSTRAINT "FK_6a2621ec0b9817d24902a6db360" FOREIGN KEY ("merchantId") REFERENCES "merchant"("merchantId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_details" ADD CONSTRAINT "FK_314335aaaa5c6df8614559f9aec" FOREIGN KEY ("paymentId") REFERENCES "payment"("paymentId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_6e8197df3089b1fb86058236935" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_07d0260210e4a41a97aaa077a3d" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_f4c3d03dc45416b0392b55c63ca" FOREIGN KEY ("providerId") REFERENCES "payment_provider"("providerId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_orders" ADD CONSTRAINT "FK_d2edb31d314bc7351455bdd8ffe" FOREIGN KEY ("merchantId") REFERENCES "merchant"("merchantId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_session" ADD CONSTRAINT "FK_4894c9b488ebfe2783c8751526c" FOREIGN KEY ("merchantId") REFERENCES "merchant"("merchantId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_session" DROP CONSTRAINT "FK_4894c9b488ebfe2783c8751526c"`);
        await queryRunner.query(`ALTER TABLE "payment_orders" DROP CONSTRAINT "FK_d2edb31d314bc7351455bdd8ffe"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_f4c3d03dc45416b0392b55c63ca"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_07d0260210e4a41a97aaa077a3d"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_6e8197df3089b1fb86058236935"`);
        await queryRunner.query(`ALTER TABLE "payment_details" DROP CONSTRAINT "FK_314335aaaa5c6df8614559f9aec"`);
        await queryRunner.query(`ALTER TABLE "merchant_detail" DROP CONSTRAINT "FK_6a2621ec0b9817d24902a6db360"`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"`);
        await queryRunner.query(`ALTER TABLE "user_detail" DROP CONSTRAINT "FK_455dfebe9344ffecf1c8e8e054d"`);
        await queryRunner.query(`DROP TABLE "audit_trail"`);
        await queryRunner.query(`DROP TABLE "merchant_category"`);
        await queryRunner.query(`DROP TABLE "payment_session"`);
        await queryRunner.query(`DROP TYPE "public"."payment_session_status_enum"`);
        await queryRunner.query(`DROP TABLE "merchant_audit_log"`);
        await queryRunner.query(`DROP TYPE "public"."merchant_audit_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c6db1f43c150372d3636ef3d3e"`);
        await queryRunner.query(`DROP TABLE "payment_orders"`);
        await queryRunner.query(`DROP TYPE "public"."payment_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "audit_log"`);
        await queryRunner.query(`DROP TYPE "public"."provider_status_audit"`);
        await queryRunner.query(`DROP TYPE "public"."payment_audit_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."redirect_status_enum"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status"`);
        await queryRunner.query(`DROP TYPE "public"."payment_type_enum"`);
        await queryRunner.query(`DROP TABLE "payment_details"`);
        await queryRunner.query(`DROP TABLE "merchant"`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum"`);
        await queryRunner.query(`DROP TABLE "merchant_detail"`);
        await queryRunner.query(`DROP TABLE "payment_provider"`);
        await queryRunner.query(`DROP TYPE "public"."provider_status_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "user_settings"`);
        await queryRunner.query(`DROP TABLE "user_detail"`);
    }

}
