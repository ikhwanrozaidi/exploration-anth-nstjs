import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletStatusAndWithdrawal1766633186632 implements MigrationInterface {
    name = 'AddWalletStatusAndWithdrawal1766633186632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop old payment foreign key constraints
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_buyer"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_seller"`);
        
        // 2. Create withdrawal_status_enum
        await queryRunner.query(`CREATE TYPE "public"."withdrawal_status_enum" AS ENUM('requested', 'pending', 'complete', 'fail')`);
        
        // 3. Create withdrawal table
        await queryRunner.query(`
            CREATE TABLE "withdrawal" (
                "id" SERIAL NOT NULL, 
                "userId" integer NOT NULL, 
                "amount" numeric(10,2) NOT NULL, 
                "bankName" character varying NOT NULL, 
                "bankNumber" character varying NOT NULL, 
                "status" "public"."withdrawal_status_enum" NOT NULL DEFAULT 'requested', 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_840e247aaad3fbd4e18129122a2" PRIMARY KEY ("id")
            )
        `);
        
        // 4. Create wallet_status_enum
        await queryRunner.query(`CREATE TYPE "public"."wallet_status_enum" AS ENUM('pending', 'success', 'fail')`);
        
        // 5. Add status column to wallet (nullable first)
        await queryRunner.query(`ALTER TABLE "wallet" ADD "status" "public"."wallet_status_enum"`);
        
        // 6. ✅ CRITICAL: Set existing rows to 'success' (assuming completed transactions)
        await queryRunner.query(`UPDATE "wallet" SET "status" = 'success' WHERE "status" IS NULL`);
        
        // 7. Make status NOT NULL with default
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        
        // 8. Update user_role_enum
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        
        // 9. Update user_status_enum
        await queryRunner.query(`ALTER TYPE "public"."user_status_enum" RENAME TO "user_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" TYPE "public"."user_status_enum" USING "status"::"text"::"public"."user_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum_old"`);
        
        // 10. Update merchant_status_enum
        await queryRunner.query(`ALTER TYPE "public"."merchant_status_enum" RENAME TO "merchant_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."merchant_status_enum" AS ENUM('active', 'inactive', 'pending', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" TYPE "public"."merchant_status_enum" USING "status"::"text"::"public"."merchant_status_enum"`);
        await queryRunner.query(`ALTER TABLE "merchant" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."merchant_status_enum_old"`);
        
        // 11. Update wallet_direction_enum (CRITICAL: Update both wallet and account_audit)
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum" RENAME TO "wallet_direction_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum" USING "direction"::"text"::"public"."wallet_direction_enum"`); // ✅ ADDED
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum_old"`);
        
        // 12. Update wallet_source_enum
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum" RENAME TO "wallet_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum" USING "source"::"text"::"public"."wallet_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum_old"`);
        
        // 13. Recreate payment foreign key constraints
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_e100d5b71905d0da0c963c0e6c8" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_3297a8d685830f18b06a94d687b" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // 14. Add withdrawal foreign key constraint
        await queryRunner.query(`ALTER TABLE "withdrawal" ADD CONSTRAINT "FK_6eb34227c6d10e54e2d0d3f575f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop withdrawal foreign key
        await queryRunner.query(`ALTER TABLE "withdrawal" DROP CONSTRAINT "FK_6eb34227c6d10e54e2d0d3f575f"`);
        
        // 2. Drop payment foreign keys
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_3297a8d685830f18b06a94d687b"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_e100d5b71905d0da0c963c0e6c8"`);
        
        // 3. Rollback wallet_source_enum
        await queryRunner.query(`CREATE TYPE "public"."wallet_source_enum_old" AS ENUM('topup', 'order', 'receive', 'send')`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "source" TYPE "public"."wallet_source_enum_old" USING "source"::"text"::"public"."wallet_source_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_source_enum_old" RENAME TO "wallet_source_enum"`);
        
        // 4. Rollback wallet_direction_enum (CRITICAL: Update both tables)
        await queryRunner.query(`CREATE TYPE "public"."wallet_direction_enum_old" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "account_audit" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`); // ✅ ADDED
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "direction" TYPE "public"."wallet_direction_enum_old" USING "direction"::"text"::"public"."wallet_direction_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_direction_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_direction_enum_old" RENAME TO "wallet_direction_enum"`);
        
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
        
        // 8. Drop wallet status column
        await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_status_enum"`);
        
        // 9. Drop withdrawal table
        await queryRunner.query(`DROP TABLE "withdrawal"`);
        await queryRunner.query(`DROP TYPE "public"."withdrawal_status_enum"`);
        
        // 10. Recreate old payment foreign key constraints
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_seller" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_buyer" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}