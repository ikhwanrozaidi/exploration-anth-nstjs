import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUpdatedAtWalletAndRenameReceiverId1766634434444 implements MigrationInterface {
    name = 'AddUpdatedAtWalletAndRenameReceiverId1766634434444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Rename receiverId to oppositeId
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "receiverId"`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD "oppositeId" integer`);
        
        // 2. Add updatedAt column
        await queryRunner.query(`ALTER TABLE "wallet" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        
        // 3. Update user_role_enum
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        
        // 4. Update user_status_enum
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum" RENAME TO "user_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum" USING "status"::"text"::"public"."user_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum_old"`);
        
        // 5. Update merchant_status_enum
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum" RENAME TO "merchant_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum" USING "status"::"text"::"public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum_old"`);
        
        // 6. Update withdrawal_status_enum
        await queryRunner.query(`ALTER TYPE "public"."withdrawal_status_enum" RENAME TO "withdrawal_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."withdrawal_status_enum" AS ENUM('requested', 'pending', 'complete', 'fail')`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" TYPE "public"."withdrawal_status_enum" USING "status"::"text"::"public"."withdrawal_status_enum"`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" SET DEFAULT 'requested'`);
        await queryRunner.query(`DROP TYPE "public"."withdrawal_status_enum_old"`);
        
        // 7. ✅ CRITICAL FIX: Update wallet_direction_enum (BOTH tables)
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum" RENAME TO "wallet_direction_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`); // ✅ ADDED
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum_old"`);
        
        // 8. Update wallet_source_enum
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum" RENAME TO "wallet_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum" USING "source"::"text"::"public"."wallet_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum_old"`);
        
        // 9. Update wallet_status_enum
        await queryRunner.query(`ALTER TYPE "public"."wallet_status_enum" RENAME TO "wallet_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_status_enum" AS ENUM('pending', 'success', 'fail')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" TYPE "public"."wallet_status_enum" USING "status"::"text"::"public"."wallet_status_enum"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."wallet_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Rollback wallet_status_enum
        await queryRunner.query(`CREATE TYPE "public"."wallet_status_enum_old" AS ENUM('pending', 'success', 'fail')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" TYPE "public"."wallet_status_enum_old" USING "status"::"text"::"public"."wallet_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."wallet_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_status_enum_old" RENAME TO "wallet_status_enum"`);
        
        // 2. Rollback wallet_source_enum
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum_old" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum_old" USING "source"::"text"::"public"."wallet_source_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum_old" RENAME TO "wallet_source_enum"`);
        
        // 3. ✅ CRITICAL FIX: Rollback wallet_direction_enum (BOTH tables)
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum_old" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`); // ✅ ADDED
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum_old" RENAME TO "wallet_direction_enum"`);
        
        // 4. Rollback withdrawal_status_enum
        await queryRunner.query(`CREATE TYPE "public"."withdrawal_status_enum_old" AS ENUM('requested', 'pending', 'complete', 'fail')`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" TYPE "public"."withdrawal_status_enum_old" USING "status"::"text"::"public"."withdrawal_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" SET DEFAULT 'requested'`);
        await queryRunner.query(`DROP TYPE "public"."withdrawal_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."withdrawal_status_enum_old" RENAME TO "withdrawal_status_enum"`);
        
        // 5. Rollback merchant_status_enum
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum_old" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum_old" USING "status"::"text"::"public"."merchant_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum_old" RENAME TO "merchant_status_enum"`);
        
        // 6. Rollback user_status_enum
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum_old" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum_old" USING "status"::"text"::"public"."user_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum_old" RENAME TO "user_status_enum"`);
        
        // 7. Rollback user_role_enum
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        
        // 8. Rollback wallet columns
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "oppositeId"`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD "receiverId" integer`);
    }
}