import { Module } from '@nestjs/common';
import { PaymentProviderController } from './payment-provider.controller';
import { PaymentProviderService } from './providers/payment-provider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentProvider } from './payment-provider.entity';

@Module({
  controllers: [PaymentProviderController],
  providers: [PaymentProviderService],
  imports:[
    TypeOrmModule.forFeature([PaymentProvider]),
  ]
})
export class PaymentProviderModule {}
