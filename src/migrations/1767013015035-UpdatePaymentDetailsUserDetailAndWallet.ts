import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentDetailsUserDetailAndWallet1767013015035 implements MigrationInterface {
    name = 'UpdatePaymentDetailsUserDetailAndWallet1767013015035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create DeliveryStatus enum for payment_details
        await queryRunner.query(`CREATE TYPE "public"."payment_details_deliverystatus_enum" AS ENUM('preparing', 'shipping', 'delivered', 'issue')`);
        await queryRunner.query(`ALTER TABLE "payment_details" ADD "deliveryStatus" "public"."payment_details_deliverystatus_enum" DEFAULT 'preparing'`);
        
        // 2. Add paymentId to wallet
        await queryRunner.query(`ALTER TABLE "wallet" ADD "paymentId" uuid`);
        
        // 3. Migrate user_detail.verify from boolean to enum WITH DATA PRESERVATION
        await queryRunner.query(`CREATE TYPE "public"."user_detail_verify_enum" AS ENUM('pending', 'verified', 'failed', 'unverified')`);
        await queryRunner.query(`ALTER TABLE "user_detail" ADD "verify_temp" "public"."user_detail_verify_enum"`);
        await queryRunner.query(`
            UPDATE "user_detail" 
            SET "verify_temp" = CASE 
                WHEN "verify" = true THEN 'verified'::"user_detail_verify_enum"
                ELSE 'unverified'::"user_detail_verify_enum"
            END
        `);
        await queryRunner.query(`ALTER TABLE "user_detail" ALTER COLUMN "verify_temp" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_detail" DROP COLUMN "verify"`);
        await queryRunner.query(`ALTER TABLE "user_detail" RENAME COLUMN "verify_temp" TO "verify"`);
        await queryRunner.query(`ALTER TABLE "user_detail" ALTER COLUMN "verify" SET DEFAULT 'unverified'`);
        
        // 4. Update user_role_enum
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        
        // 5. Update user_status_enum
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum" RENAME TO "user_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum" USING "status"::"text"::"public"."user_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum_old"`);
        
        // 6. Update merchant_status_enum
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum" RENAME TO "merchant_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum" USING "status"::"text"::"public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum_old"`);
        
        // 7. Update withdrawal_status_enum
        await queryRunner.query(`ALTER TYPE "public"."withdrawal_status_enum" RENAME TO "withdrawal_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."withdrawal_status_enum" AS ENUM('requested', 'pending', 'complete', 'fail')`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" TYPE "public"."withdrawal_status_enum" USING "status"::"text"::"public"."withdrawal_status_enum"`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" SET DEFAULT 'requested'`);
        await queryRunner.query(`DROP TYPE "public"."withdrawal_status_enum_old"`);
        
        // 8. Update wallet_direction_enum (SHARED BY wallet AND account_audit - only direction column exists!)
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum" RENAME TO "wallet_direction_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum" AS ENUM('in', 'out')`);
        
        // Update BOTH tables that use this enum
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum_old"`);
        
        // 9. Update wallet_source_enum (ONLY wallet table has this column!)
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum" RENAME TO "wallet_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum" USING "source"::"text"::"public"."wallet_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum_old"`);
        
        // 10. Update wallet_status_enum (ONLY wallet table has this column!)
        await queryRunner.query(`ALTER TYPE "public"."wallet_status_enum" RENAME TO "wallet_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_status_enum" AS ENUM('pending', 'success', 'fail')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" TYPE "public"."wallet_status_enum" USING "status"::"text"::"public"."wallet_status_enum"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."wallet_status_enum_old"`);
        
        // 11. Add foreign key constraint for wallet.paymentId
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_6dbe5ef5e3d33f9d36799fceb05" FOREIGN KEY ("paymentId") REFERENCES "payment"("paymentId") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop foreign key
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_6dbe5ef5e3d33f9d36799fceb05"`);
        
        // 2. Revert wallet_status_enum (ONLY wallet)
        await queryRunner.query(`CREATE TYPE "public"."wallet_status_enum_old" AS ENUM('pending', 'success', 'fail')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" TYPE "public"."wallet_status_enum_old" USING "status"::"text"::"public"."wallet_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."wallet_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_status_enum_old" RENAME TO "wallet_status_enum"`);
        
        // 3. Revert wallet_source_enum (ONLY wallet)
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum_old" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum_old" USING "source"::"text"::"public"."wallet_source_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum_old" RENAME TO "wallet_source_enum"`);
        
        // 4. Revert wallet_direction_enum (BOTH tables)
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum_old" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum_old" RENAME TO "wallet_direction_enum"`);
        
        // 5. Revert withdrawal_status_enum
        await queryRunner.query(`CREATE TYPE "public"."withdrawal_status_enum_old" AS ENUM('requested', 'pending', 'complete', 'fail')`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" TYPE "public"."withdrawal_status_enum_old" USING "status"::"text"::"public"."withdrawal_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" SET DEFAULT 'requested'`);
        await queryRunner.query(`DROP TYPE "public"."withdrawal_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."withdrawal_status_enum_old" RENAME TO "withdrawal_status_enum"`);
        
        // 6. Revert merchant_status_enum
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum_old" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum_old" USING "status"::"text"::"public"."merchant_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum_old" RENAME TO "merchant_status_enum"`);
        
        // 7. Revert user_status_enum
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum_old" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum_old" USING "status"::"text"::"public"."user_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum_old" RENAME TO "user_status_enum"`);
        
        // 8. Revert user_role_enum
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        
        // 9. Revert user_detail.verify from enum back to boolean
        await queryRunner.query(`ALTER TABLE "user_detail" ADD "verify_temp" boolean`);
        await queryRunner.query(`
            UPDATE "user_detail" 
            SET "verify_temp" = CASE 
                WHEN "verify" = 'verified' THEN true
                ELSE false
            END
        `);
        await queryRunner.query(`ALTER TABLE "user_detail" ALTER COLUMN "verify_temp" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_detail" ALTER COLUMN "verify_temp" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_detail" DROP COLUMN "verify"`);
        await queryRunner.query(`ALTER TABLE "user_detail" RENAME COLUMN "verify_temp" TO "verify"`);
        await queryRunner.query(`DROP TYPE "public"."user_detail_verify_enum"`);
        
        // 10. Remove paymentId from wallet
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "paymentId"`);
        
        // 11. Remove deliveryStatus from payment_details
        await queryRunner.query(`ALTER TABLE "payment_details" DROP COLUMN "deliveryStatus"`);
        await queryRunner.query(`DROP TYPE "public"."payment_details_deliverystatus_enum"`);
    }
}