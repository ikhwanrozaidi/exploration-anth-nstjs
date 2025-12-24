// src/payment/providers/create-order.provider.ts

import { 
  Injectable, 
  BadRequestException,
  NotFoundException,
  RequestTimeoutException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { AccountAudit } from 'src/audit-log/entity/account-audit.entity';
import { PaymentType, PaymentStatus, WalletDirection } from 'src/common/enums/app.enums';
import { BuyerCreateOrderDto } from '../dtos/create-order.dto';
import { Payment } from 'src/payment/payment.entity';
import { PaymentDetails } from 'src/payment/entity/payment-details.entity';
import { P2P_PERCENTAGE_FEES, P2P_PROVIDER_ID } from 'src/payment/constant/payment.constant';

@Injectable()
export class CreateOrderProvider {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(PaymentDetails)
    private readonly paymentDetailsRepository: Repository<PaymentDetails>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AccountAudit)
    private readonly accountAuditRepository: Repository<AccountAudit>,

    private readonly dataSource: DataSource,
  ) {}

  async createOrder(
    buyerId: number,
    createOrderDto: BuyerCreateOrderDto,
    ipAddress?: string,
  ): Promise<Payment> {

    console.log('CreateOrderProvider: Starting P2P payment creation');
    console.log('Buyer ID:', buyerId);
    console.log('Seller Username:', createOrderDto.sellerUsername);
    console.log('Amount:', createOrderDto.amount);

    // Convert amount to number
    const amount = parseFloat(createOrderDto.amount);

    // Calculate fee
    const feeAmount = amount * P2P_PERCENTAGE_FEES;
    console.log('Transaction fee (2%):', feeAmount);

    // Step 1: Find sender
    const buyer = await this.userRepository.findOne({
      where: { id: buyerId }
    });

    if (!buyerId) {
      throw new NotFoundException('Sender not found');
    }

    // Step 2: Find seller by username
    const seller = await this.userRepository.findOne({
      where: { username: createOrderDto.sellerUsername },
      relations: ['userDetail'], // Load userDetail to get fullName
    });

    if (!seller) {
      throw new BadRequestException('Username not found');
    }

    console.log('Seller found:', seller.email);

    // Step 3: Check if sender has sufficient balance
    if (parseFloat(buyer.balance.toString()) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    console.log('Balance check passed');
    console.log('Buyer balance before:', buyer.balance);

    // Step 4: Get latest Gatepay balance from account_audit
    const latestAudit = await this.accountAuditRepository.findOne({
      order: { createdAt: 'DESC' }
    });

    const currentGatepayBalance = latestAudit 
      ? parseFloat(latestAudit.balance.toString()) 
      : 0;

    const newGatepayBalance = currentGatepayBalance + feeAmount;

    console.log('Gatepay balance before:', currentGatepayBalance);
    console.log('Gatepay balance after:', newGatepayBalance);

    // Step 5: Create transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 5a. Deduct amount from buyer's balance
      buyer.balance = parseFloat(buyer.balance.toString()) - amount;
      await queryRunner.manager.save(buyer);

      console.log('Sender balance after deduction:', buyer.balance);

      // 5b. Create Payment record
      const payment = queryRunner.manager.create(Payment, {
        paymentType: PaymentType.P2P,
        senderId: buyerId.toString(),
        receiverId: seller.id.toString(),
        merchantId: null,
        amount: amount,
        isRequest: false,
        status: PaymentStatus.SUCCESS,
        merchantOrderId: null,
        isCompleted: false,
        providerId: P2P_PROVIDER_ID,
        ipAddress: ipAddress || null,
      });

      const savedPayment = await queryRunner.manager.save(payment);
      console.log('Payment created with ID:', savedPayment.paymentId);

      // 5c. Create PaymentDetails record
      const buyerName = seller.userDetail?.fullName || 
                        `${seller.userDetail?.firstName || ''} ${seller.userDetail?.lastName || ''}`.trim() || 
                        seller.email.split('@')[0]; // Fallback to email username

      const paymentDetails = queryRunner.manager.create(PaymentDetails, {
        paymentId: savedPayment.paymentId,
        signature: null,
        productName: createOrderDto.productName,
        productDesc: createOrderDto.productDesc,
        productCat: createOrderDto.productCat,
        amount: amount,
        buyerName: buyerName,
        buyerEmail: seller.email,
        buyerPhone: seller.phone || null,
        refundable: true,
      });

      await queryRunner.manager.save(paymentDetails);
      console.log('PaymentDetails created for payment ID:', savedPayment.paymentId);

      // 5d. Create AccountAudit record (Gatepay profit tracking)
      const accountAudit = queryRunner.manager.create(AccountAudit, {
        paymentId: savedPayment.paymentId,
        percentage: P2P_PERCENTAGE_FEES,
        amount: feeAmount,
        balance: newGatepayBalance,
        direction: WalletDirection.IN,
      });

      await queryRunner.manager.save(accountAudit);
      console.log('AccountAudit created - Gatepay profit recorded:', feeAmount);

      // Commit transaction
      await queryRunner.commitTransaction();
      console.log('Transaction committed successfully');

      // Return payment with relations
      const result = await this.paymentRepository.findOne({
        where: { paymentId: savedPayment.paymentId },
        relations: ['paymentDetails', 'sender', 'receiver', 'provider'],
      });

      return result;

    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Transaction failed, rolling back:', error);
      
      throw new RequestTimeoutException(
        'Unable to process payment at the moment. Please try again later.',
        {
          description: 'Payment transaction failed',
        },
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}