import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './providers/merchant.service';
import { Merchant } from './merchant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantDetail } from './entity/merchant-details.entity';
import { MerchantAuditLog } from './entity/merchant-audit-log.entity';
import { CreateMerchantProvider } from './providers/create-merchant.provider';
import { KeyGenerationProvider } from './providers/key-generation.provider';
import { MerchantValidationProvider } from './providers/merchant-validation.provider';
import { User } from 'src/users/user.entity';
import { CreateMerchantDetailProvider } from './providers/create-merchantdetail.provider';
import { FetchAllMerchantsProvider } from './providers/fetch-all-merchant.provider';
import { MerchantDetailValidationProvider } from './providers/merchantdetail-validation.provider';
import { UpdateMerchantStatusProvider } from './providers/update-merchant-status.provider';

@Module({
  controllers: [MerchantController],
  providers: [
    MerchantService,
    CreateMerchantProvider,
    KeyGenerationProvider,
    MerchantValidationProvider,
    CreateMerchantDetailProvider,
    FetchAllMerchantsProvider,
    MerchantDetailValidationProvider,
    UpdateMerchantStatusProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      MerchantDetail,
      MerchantAuditLog,
      User,
    ]),
  ]
})
export class MerchantModule { }
