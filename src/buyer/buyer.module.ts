import { Module } from '@nestjs/common';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';
import { CreateOrderProvider } from './providers/create-order.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payment/payment.entity';
import { PaymentDetails } from 'src/payment/entity/payment-details.entity';
import { User } from 'src/users/user.entity';
import { AccountAudit } from 'src/audit-log/entity/account-audit.entity';

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
    ],
})
export class BuyerModule {}
