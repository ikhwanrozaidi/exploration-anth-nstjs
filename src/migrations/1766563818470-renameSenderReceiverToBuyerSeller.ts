// src/migrations/1766563818470-renameSenderReceiverToBuyerSeller.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSenderReceiverToBuyerSeller1766563818470 implements MigrationInterface {
    name = 'RenameSenderReceiverToBuyerSeller1766563818470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. RENAME PAYMENT COLUMNS (preserves data)
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "senderId" TO "buyerId"`);
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "receiverId" TO "sellerId"`);
        
        // 2. DROP OLD FOREIGN KEY CONSTRAINTS
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_07d0260210e4a41a97aaa077a3d"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_6e8197df3089b1fb86058236935"`);
        
        // 3. CREATE NEW FOREIGN KEY CONSTRAINTS
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_buyer" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_seller" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // 4. UPDATE PAYMENT_DETAILS CONSTRAINTS
        await queryRunner.query(`ALTER TABLE "payment_details" ALTER COLUMN "productDesc" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_details" ALTER COLUMN "buyerName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_details" ALTER COLUMN "buyerEmail" DROP NOT NULL`);
        
        // 5. USER ROLE ENUM
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        
        // 6. USER STATUS ENUM
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum" RENAME TO "user_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum" USING "status"::"text"::"public"."user_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum_old"`);
        
        // 7. MERCHANT STATUS ENUM
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum" RENAME TO "merchant_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum" USING "status"::"text"::"merchant_status_enum"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum_old"`);
        
        // 8. WALLET DIRECTION ENUM (UPDATE BOTH TABLES!)
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum" RENAME TO "wallet_direction_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum" AS ENUM('in', 'out')`);
        
        // ✅ UPDATE BOTH wallet AND account_audit tables
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        
        // ✅ NOW safe to drop old enum
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum_old"`);
        
        // 9. WALLET SOURCE ENUM
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum" RENAME TO "wallet_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum" USING "source"::"text"::"public"."wallet_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // REVERSE WALLET SOURCE ENUM
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum_old" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum_old" USING "source"::"text"::"public"."wallet_source_enum_old"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" SET DEFAULT 'topup'`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum_old" RENAME TO "wallet_source_enum"`);
        
        // REVERSE WALLET DIRECTION ENUM (BOTH TABLES!)
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum_old" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum_old" RENAME TO "wallet_direction_enum"`);
        
        // REVERSE MERCHANT STATUS ENUM
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum_old" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum_old" USING "status"::"text"::"public"."merchant_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum_old" RENAME TO "merchant_status_enum"`);
        
        // REVERSE USER STATUS ENUM
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum_old" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum_old" USING "status"::"text"::"public"."user_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum_old" RENAME TO "user_status_enum"`);
        
        // REVERSE USER ROLE ENUM
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        
        // REVERSE PAYMENT_DETAILS CHANGES
        await queryRunner.query(`ALTER TABLE "payment_details" ALTER COLUMN "buyerEmail" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_details" ALTER COLUMN "buyerName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_details" ALTER COLUMN "productDesc" DROP NOT NULL`);
        
        // REVERSE FOREIGN KEYS
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_seller"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_buyer"`);
        
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_6e8197df3089b1fb86058236935" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_07d0260210e4a41a97aaa077a3d" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // REVERSE COLUMN RENAMES
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "sellerId" TO "receiverId"`);
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "buyerId" TO "senderId"`);
    }
}