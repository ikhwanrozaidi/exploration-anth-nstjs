import { Module } from '@nestjs/common';
import { PaymentService } from './providers/payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentDetails } from './entity/payment-details.entity';
import { User } from 'src/users/user.entity';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports:[
    TypeOrmModule.forFeature([Payment, PaymentDetails, User]),
  ]
})
export class PaymentModule {}
