// src/payment/providers/complete-payment.provider.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from '../payment.entity';
import { User } from 'src/users/user.entity';
import { Wallet } from 'src/wallet/entity/wallet.entity';
import { PaymentStatus, WalletDirection, WalletSource, WalletStatus } from 'src/common/enums/app.enums';
import { PaymentProofUploadProvider, ProofUploadResult } from './payment-proof-upload.provider';

@Injectable()
export class CompletePaymentProvider {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    private readonly proofUploadProvider: PaymentProofUploadProvider,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Mark payment as completed with proof images
   * All comparisons use numbers (sellerId, buyerId, merchantId are all numbers)
   */
  async completePayment(
    userId: number,
    paymentId: string,
    proofImages: Express.Multer.File[],
  ): Promise<{
    payment: Payment;
    proofImages: ProofUploadResult[];
  }> {
    console.log('CompletePaymentProvider: Marking payment as completed');
    console.log('User ID:', userId);
    console.log('Payment ID:', paymentId);

    // Step 1: Find payment
    const payment = await this.paymentRepository.findOne({
      where: { paymentId },
      relations: ['buyer', 'seller', 'paymentDetails'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Step 2: Verify BUYER is marking as complete
    if (payment.buyerId !== userId) {
      throw new ForbiddenException(
        'Only the buyer can confirm receipt and mark payment as completed'
      );
    }

    console.log('Authorization: Buyer is marking payment as completed');

    // Step 3: Validate payment state
    if (payment.isCompleted) {
      throw new BadRequestException('Payment is already marked as completed');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException(
        `Payment cannot be completed. Current status: ${payment.status}`
      );
    }

    // Step 4: Validate proof images
    if (!proofImages || proofImages.length === 0) {
      throw new BadRequestException('At least one proof image is required');
    }

    if (proofImages.length > 5) {
      throw new BadRequestException('Maximum 5 proof images allowed');
    }

    console.log('Uploading', proofImages.length, 'proof images');

    // Step 5: Upload proof images
    const uploadResults = await this.proofUploadProvider.uploadProofImages(
      proofImages,
      paymentId,
    );

    console.log('Proof images uploaded successfully:', uploadResults.length);

    // Step 6: Get seller user
    const seller = await this.userRepository.findOne({
      where: { id: payment.sellerId }
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    // Step 7: Use transaction to update seller balance, create wallet record, and mark payment complete
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const paymentAmount = parseFloat(payment.amount.toString());
      const currentBalance = parseFloat(seller.balance.toString());
      const newBalance = currentBalance + paymentAmount;

      // 7a. Update seller balance
      seller.balance = newBalance;
      await queryRunner.manager.save(seller);

      console.log('Transferred', paymentAmount, 'to seller ID:', seller.id);
      console.log('Seller new balance:', newBalance);

      // 7b. Create wallet transaction record
      const walletRecord = queryRunner.manager.create(Wallet, {
        userId: seller.id,
        amount: paymentAmount,
        direction: WalletDirection.IN,
        balance: newBalance,
        source: WalletSource.ORDER,
        status: WalletStatus.SUCCESS,
        oppositeId: payment.buyerId,
        reference: `ORDER_COMPLETE_${payment.paymentId}`,
      });

      await queryRunner.manager.save(walletRecord);
      console.log('Wallet record created for seller:', walletRecord.id);

      // 7c. Mark payment as completed
      payment.isCompleted = true;
      await queryRunner.manager.save(payment);

      console.log('Payment marked as completed:', payment.paymentId);

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        payment: payment,
        proofImages: uploadResults,
      };

    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Error completing payment:', error);
      throw new BadRequestException('Failed to complete payment. Please try again.');
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}