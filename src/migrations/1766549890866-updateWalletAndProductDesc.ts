import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWalletAndProductDesc1766549890866 implements MigrationInterface {
    name = 'UpdateWalletAndProductDesc1766549890866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create wallet_source_enum
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum" AS ENUM('topup', 'order', 'receive', 'send')`);
        
        // 2. Add new columns to wallet
        await queryRunner.query(`ALTER TABLE "wallet" ADD "source" "public"."wallet_source_enum" NOT NULL DEFAULT 'topup'`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD "receiverId" integer`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD "reference" character varying`);
        
        // 3. User role enum migration
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        
        // 4. User status enum migration
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum" RENAME TO "user_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum" USING "status"::"text"::"public"."user_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum_old"`);
        
        // 5. Payment details signature nullable
        await queryRunner.query(`ALTER TABLE "payment_details" ALTER COLUMN "signature" DROP NOT NULL`);
        
        // 6. Migrate productDesc from varchar to json array (PRESERVE DATA)
        await queryRunner.query(`ALTER TABLE "payment_details" ADD "productDescTemp" json`);
        await queryRunner.query(`
            UPDATE "payment_details" 
            SET "productDescTemp" = 
                CASE 
                    WHEN "productDesc" IS NULL THEN NULL
                    WHEN "productDesc" = '' THEN '[]'::json
                    ELSE json_build_array("productDesc")
                END
        `);
        await queryRunner.query(`ALTER TABLE "payment_details" DROP COLUMN "productDesc"`);
        await queryRunner.query(`ALTER TABLE "payment_details" RENAME COLUMN "productDescTemp" TO "productDesc"`);
        
        // 7. Merchant status enum migration
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum" RENAME TO "merchant_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum" USING "status"::"text"::"public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum_old"`);
        
        // 8. Wallet direction enum migration (recreate)
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum" RENAME TO "wallet_direction_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum" AS ENUM('in', 'out')`);
        
        // ✅ UPDATE BOTH TABLES BEFORE DROPPING OLD ENUM
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        
        // ✅ NOW SAFE TO DROP OLD ENUM
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Wallet direction enum rollback
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum_old" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum_old" RENAME TO "wallet_direction_enum"`);
        
        // 2. Merchant status enum rollback
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum_old" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum_old" USING "status"::"text"::"public"."merchant_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum_old" RENAME TO "merchant_status_enum"`);
        
        // 3. Revert productDesc from json back to varchar (PRESERVE DATA)
        await queryRunner.query(`ALTER TABLE "payment_details" ADD "productDescTemp" character varying`);
        await queryRunner.query(`
            UPDATE "payment_details" 
            SET "productDescTemp" = 
                CASE 
                    WHEN "productDesc" IS NULL THEN NULL
                    WHEN "productDesc"::text = '[]' THEN ''
                    ELSE "productDesc"->>0
                END
        `);
        await queryRunner.query(`ALTER TABLE "payment_details" DROP COLUMN "productDesc"`);
        await queryRunner.query(`ALTER TABLE "payment_details" RENAME COLUMN "productDescTemp" TO "productDesc"`);
        
        // 4. Payment details signature not null
        await queryRunner.query(`ALTER TABLE "payment_details" ALTER COLUMN "signature" SET NOT NULL`);
        
        // 5. User status enum rollback
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum_old" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum_old" USING "status"::"text"::"public"."user_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum_old" RENAME TO "user_status_enum"`);
        
        // 6. User role enum rollback
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        
        // 7. Drop wallet columns
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "reference"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "receiverId"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "source"`);
        
        // 8. Drop wallet_source_enum
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum"`);
    }
}