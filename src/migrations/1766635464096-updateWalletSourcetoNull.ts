import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWalletSourcetoNull1766635464096 implements MigrationInterface {
    name = 'UpdateWalletSourcetoNull1766635464096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Update user_role_enum
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        
        // 2. Update user_status_enum
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum" RENAME TO "user_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum" USING "status"::"text"::"public"."user_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum_old"`);
        
        // 3. Update merchant_status_enum
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum" RENAME TO "merchant_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum" USING "status"::"text"::"public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum_old"`);
        
        // 4. Update withdrawal_status_enum
        await queryRunner.query(`ALTER TYPE "public"."withdrawal_status_enum" RENAME TO "withdrawal_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."withdrawal_status_enum" AS ENUM('requested', 'pending', 'complete', 'fail')`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" TYPE "public"."withdrawal_status_enum" USING "status"::"text"::"public"."withdrawal_status_enum"`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" SET DEFAULT 'requested'`);
        await queryRunner.query(`DROP TYPE "public"."withdrawal_status_enum_old"`);
        
        // 5. ✅ CRITICAL FIX: Update wallet_direction_enum (BOTH wallet AND account_audit)
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum" RENAME TO "wallet_direction_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`); // ✅ ADDED
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum_old"`);
        
        // 6. Update wallet_source_enum
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum" RENAME TO "wallet_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum" USING "source"::"text"::"public"."wallet_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum_old"`);
        
        // 7. ✅ Make wallet.source nullable (this is the main change of this migration)
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" DROP NOT NULL`);
        
        // 8. Update wallet_status_enum
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
        
        // 2. Rollback wallet.source NOT NULL constraint
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" SET NOT NULL`);
        
        // 3. Rollback wallet_source_enum
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum_old" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum_old" USING "source"::"text"::"public"."wallet_source_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum_old" RENAME TO "wallet_source_enum"`);
        
        // 4. ✅ CRITICAL FIX: Rollback wallet_direction_enum (BOTH tables)
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum_old" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`); // ✅ ADDED
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum_old" RENAME TO "wallet_direction_enum"`);
        
        // 5. Rollback withdrawal_status_enum
        await queryRunner.query(`CREATE TYPE "public"."withdrawal_status_enum_old" AS ENUM('requested', 'pending', 'complete', 'fail')`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" TYPE "public"."withdrawal_status_enum_old" USING "status"::"text"::"public"."withdrawal_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "withdrawal" ALTER COLUMN "status" SET DEFAULT 'requested'`);
        await queryRunner.query(`DROP TYPE "public"."withdrawal_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."withdrawal_status_enum_old" RENAME TO "withdrawal_status_enum"`);
        
        // 6. Rollback merchant_status_enum
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum_old" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum_old" USING "status"::"text"::"public"."merchant_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum_old" RENAME TO "merchant_status_enum"`);
        
        // 7. Rollback user_status_enum
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum_old" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum_old" USING "status"::"text"::"public"."user_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum_old" RENAME TO "user_status_enum"`);
        
        // 8. Rollback user_role_enum
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
    }
}