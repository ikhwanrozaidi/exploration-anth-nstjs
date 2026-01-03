// src/payment/providers/create-order.provider.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  RequestTimeoutException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { AccountAudit } from 'src/audit-log/entity/account-audit.entity';
import {
  PaymentType,
  PaymentStatus,
  WalletDirection,
} from 'src/common/enums/app.enums';
import { BuyerCreateOrderDto } from '../dtos/create-order.dto';
import { Payment } from 'src/payment/payment.entity';
import { PaymentDetails } from 'src/payment/entity/payment-details.entity';
import { CreateOrderResponse } from '../interfaces/create-order-response.interface';
import p2pConfig from 'src/payment/config/p2p.config';
import { ConfigType } from '@nestjs/config';

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

    @Inject(p2pConfig.KEY)
    private readonly p2pConfiguration: ConfigType<typeof p2pConfig>,
  ) {}

  async createOrder(
    buyerId: number,
    createOrderDto: BuyerCreateOrderDto,
    ipAddress?: string,
  ): Promise<CreateOrderResponse> {
    console.log('CreateOrderProvider: Starting P2P payment creation');
    console.log('Buyer ID:', buyerId);
    console.log('Seller Username:', createOrderDto.sellerUsername);
    console.log('Amount:', createOrderDto.amount);

    // Convert amount to number
    const amount = parseFloat(createOrderDto.amount);

    // Calculate fee
    const feeAmount = amount * this.p2pConfiguration.percentageFees;
    console.log(`Transaction fee (${this.p2pConfiguration.percentageFees * 100}%):`, feeAmount);

    // Step 1: Find sender
    const buyer = await this.userRepository.findOne({
      where: { id: buyerId },
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    // Step 2: Find seller by username
    const seller = await this.userRepository.findOne({
      where: { username: createOrderDto.sellerUsername },
      relations: ['userDetail'], // Load userDetail to get fullName
    });

    if (!seller) {
      throw new BadRequestException('Seller username not found');
    }

    if (seller.id === buyerId) {
      throw new BadRequestException('You cannot create a payment to yourself');
    }

    console.log('Seller found:', seller.email);

    // Step 3: Check if sender has sufficient balance
    if (parseFloat(buyer.balance.toString()) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    console.log('Balance check passed');
    console.log('Buyer balance before:', buyer.balance);

    // Step 4: Get latest Gatepay balance from account_audit
    const latestAudit = await this.accountAuditRepository
      .createQueryBuilder('audit')
      .orderBy('audit.createdAt', 'DESC')
      .getOne();

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

      console.log('Buyer balance after deduction:', buyer.balance);

      // 5b. Create Payment record
      const payment = queryRunner.manager.create(Payment, {
        paymentType: PaymentType.P2P,
        buyerId: buyerId,
        sellerId: seller.id,
        merchantId: null,
        amount: amount,
        isRequest: false,
        status: PaymentStatus.SUCCESS,
        merchantOrderId: null,
        isCompleted: false,
        providerId: this.p2pConfiguration.providerId,
        ipAddress: ipAddress || null,
      });

      const savedPayment = await queryRunner.manager.save(payment);
      console.log('Payment created with ID:', savedPayment.paymentId);

      // 5c. Create PaymentDetails record
      const sellerName =
        seller.userDetail?.fullName ||
        `${seller.userDetail?.firstName || ''} ${seller.userDetail?.lastName || ''}`.trim() ||
        seller.email.split('@')[0];

      const paymentDetails = queryRunner.manager.create(PaymentDetails, {
        paymentId: savedPayment.paymentId,
        signature: null,
        productName: createOrderDto.productName,
        productDesc: createOrderDto.productDesc,
        productCat: createOrderDto.productCat,
        amount: amount,
        // buyerName: sellerName,
        // buyerEmail: seller.email,
        // buyerPhone: seller.phone || null,
        refundable: true,
      });

      await queryRunner.manager.save(paymentDetails);
      console.log(
        'PaymentDetails created for payment ID:',
        savedPayment.paymentId,
      );

      // 5d. Create AccountAudit record (Gatepay profit tracking)
      const accountAudit = queryRunner.manager.create(AccountAudit, {
        paymentId: savedPayment.paymentId,
        percentage: this.p2pConfiguration.percentageFees,
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
        relations: ['paymentDetails', 'buyer', 'seller', 'provider'],
      });

      return this.mapToCleanResponse(result);

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

  /**
   * Map Payment entity to clean response format
   * Removes sensitive data (passwords, provider details)
   * Removes null fields
   */
  private mapToCleanResponse(payment: Payment): CreateOrderResponse {
    const response: CreateOrderResponse = {
      paymentId: payment.paymentId,
      paymentType: payment.paymentType,
      sellerId: payment.sellerId,
      buyerId: payment.buyerId,
      amount: Number(payment.amount),
      isRequest: payment.isRequest,
      status: payment.status,
      isCompleted: payment.isCompleted,
      paymentDetails: {
        productName: payment.paymentDetails.productName,
        productDesc: payment.paymentDetails.productDesc,
        productCat: payment.paymentDetails.productCat,
        amount: Number(payment.paymentDetails.amount),
        refundable: payment.paymentDetails.refundable,
        deliveryStatus: payment.paymentDetails.deliveryStatus,
      },
      buyer: {
        id: payment.buyer.id,
        email: payment.buyer.email,
        username: payment.buyer.username,
      },
      seller: {
        id: payment.seller.id,
        email: payment.seller.email,
        username: payment.seller.username,
      },
    };

    // ✅ Only add merchantId if not null
    if (payment.merchantId !== null) {
      response.merchantId = payment.merchantId;
    }

    // ✅ Only add merchantOrderId if not null
    if (payment.merchantOrderId !== null) {
      response.merchantOrderId = payment.merchantOrderId;
    }

    // ✅ Only add optional paymentDetails fields if not null
    if (payment.paymentDetails.buyerName !== null) {
      response.paymentDetails.buyerName = payment.paymentDetails.buyerName;
    }

    if (payment.paymentDetails.buyerEmail !== null) {
      response.paymentDetails.buyerEmail = payment.paymentDetails.buyerEmail;
    }

    if (payment.paymentDetails.buyerPhone !== null) {
      response.paymentDetails.buyerPhone = payment.paymentDetails.buyerPhone;
    }

    return response;
  }
}
