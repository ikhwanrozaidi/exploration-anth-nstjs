import { Module } from '@nestjs/common';
import { PaymentService } from './providers/payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentDetails } from './entity/payment-details.entity';
import { User } from 'src/users/user.entity';
import { AccountAudit } from 'src/audit-log/entity/account-audit.entity';
import { CompletePaymentProvider } from './providers/complete-payment.provider';
import { PaymentProofUploadProvider } from './providers/payment-proof-upload.provider';
import spacesDoConfig from 'src/config/spaces-do.config';
import { ConfigModule } from '@nestjs/config';
import { FetchUserPaymentsProvider } from './providers/fetch-user-payments.provider';
import { FetchMerchantPaymentsProvider } from './providers/fetch-merchant-payments.provider';
import { PaymentQueryBuilderProvider } from './providers/payment-query-builder.provider';
import { PaymentMapperProvider } from './providers/payment-mapper.provider';
import { UserPaymentCounterProvider } from './providers/user-payment-counter.provider';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    CompletePaymentProvider,
    PaymentProofUploadProvider,
    FetchUserPaymentsProvider,
    FetchMerchantPaymentsProvider,
    PaymentQueryBuilderProvider,
    UserPaymentCounterProvider,
    PaymentMapperProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentDetails,
      User,
    ]),
    ConfigModule.forFeature(spacesDoConfig),
  ],
})
export class PaymentModule {}
