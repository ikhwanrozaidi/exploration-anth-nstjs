import { Module } from '@nestjs/common';
import { OutsideController } from './outside.controller';
import { OutsideService } from './providers/outside.service';
import { PaymentProcessingProvider } from './providers/payment-processing.provider';
import { MerchantValidationProvider } from './providers/security/merchant-validation.provider';
import { OrderValidationProvider } from './providers/order-validation.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from 'src/merchant/merchant.entity';
import { PaymentSessionProvider } from './providers/payment-session.provider';
import { SecureTokenProvider } from './providers/security/secure-token.provider';
import { PaymentSession } from './entity/payment-session.entity';
import { ConfigModule } from '@nestjs/config';
import paymentJwtConfig from './config/payment-jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { BerryPayProvider } from './providers/berrypay/berrypay.provider';
import berrypayConfig from './config/berrypay.config';
import { PaymentProvider } from 'src/payment-provider/payment-provider.entity';
import { PaymentProviderValidationProvider } from './providers/security/paymentprovider-validation.provider';
import { CallbackProcessingProvider } from './providers/callback-processing.provider';
import { SignatureValidationProvider } from './providers/security/signature-validation.provider';
import { Payment } from 'src/payment/payment.entity';
import { PaymentDetails } from 'src/payment/entity/payment-details.entity';
import { BerrypayPaymentMappingProvider } from './providers/berrypay/berrypay-paymentmapping.provider';

@Module({
  controllers: [OutsideController],
  providers: [
    OutsideService,
    PaymentProcessingProvider,
    MerchantValidationProvider,
    SignatureValidationProvider,
    OrderValidationProvider,
    PaymentSessionProvider,
    SecureTokenProvider,
    BerryPayProvider,
    PaymentProviderValidationProvider,
    CallbackProcessingProvider,
    BerrypayPaymentMappingProvider
  ],
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      PaymentSession,
      User,
      PaymentProvider,
      Payment,
      PaymentDetails,
    ]),
    ConfigModule.forFeature(paymentJwtConfig),
    ConfigModule.forFeature(berrypayConfig),
    JwtModule.registerAsync(paymentJwtConfig.asProvider()),
  ],
  exports: [OutsideService],
})
export class OutsideModule {}
