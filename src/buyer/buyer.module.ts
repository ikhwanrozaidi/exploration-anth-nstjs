import { Module } from '@nestjs/common';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';
import { CreateOrderProvider } from './providers/create-order.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payment/payment.entity';
import { PaymentDetails } from 'src/payment/entity/payment-details.entity';
import { User } from 'src/users/user.entity';
import { AccountAudit } from 'src/audit-log/entity/account-audit.entity';
import p2pConfig from 'src/payment/config/p2p.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [BuyerController],
  providers: [BuyerService, CreateOrderProvider],
   imports: [
      TypeOrmModule.forFeature([
        Payment,
        PaymentDetails,
        User,
        AccountAudit,
      ]),
      ConfigModule.forFeature(p2pConfig),
    ],
})
export class BuyerModule {}
