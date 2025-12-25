// src/payment/providers/complete-payment.provider.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';
import { User } from 'src/users/user.entity';
import { PaymentStatus, PaymentType } from 'src/common/enums/app.enums';
import { PaymentProofUploadProvider, ProofUploadResult } from './payment-proof-upload.provider';

@Injectable()
export class CompletePaymentProvider {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly proofUploadProvider: PaymentProofUploadProvider,
  ) {}

  /**
   * Mark payment as completed with proof images
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
    const userIdString = userId.toString();
    if (payment.buyerId !== userIdString) {
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

    // Step 4: Upload proof images
    const uploadedProofs = await this.proofUploadProvider.uploadProofImages(
      proofImages,
      paymentId,
    );

    console.log('Proof images uploaded successfully');

    // Step 5: Release funds from escrow
    await this.releaseFunds(payment);

    // Step 6: Mark payment as completed
    payment.isCompleted = true;
    payment.updatedAt = new Date();

    const updatedPayment = await this.paymentRepository.save(payment);

    console.log('Payment marked as completed successfully');

    return {
      payment: updatedPayment,
      proofImages: uploadedProofs,
    };
  }

  /**
   * Release funds from escrow to recipient
   */
  private async releaseFunds(payment: Payment): Promise<void> {
    console.log('Releasing funds from escrow...');

    if (payment.paymentType === PaymentType.GATEWAY) {
      // Gateway: Release to merchant owner's wallet
      await this.releaseToMerchant(payment);
    } else if (payment.paymentType === PaymentType.P2P) {
      // P2P: Release to seller's wallet
      await this.releaseToSeller(payment);
    }
  }

  /**
   * Release funds to merchant owner's wallet
   */
  private async releaseToMerchant(payment: Payment): Promise<void> {
    if (!payment.merchantId) {
      throw new BadRequestException('Merchant ID is required for gateway payments');
    }

    // Find user who owns this merchant
    const merchantOwner = await this.userRepository.findOne({
      where: { merchantId: payment.merchantId }
    });

    if (!merchantOwner) {
      throw new NotFoundException(
        `No user found for merchant ID ${payment.merchantId}`
      );
    }

    console.log(`Releasing ${payment.amount} to merchant owner (User ${merchantOwner.id})`);

    // Add funds to merchant owner's wallet
    const currentBalance = parseFloat(merchantOwner.balance.toString());
    const paymentAmount = parseFloat(payment.amount.toString());
    merchantOwner.balance = currentBalance + paymentAmount;

    await this.userRepository.save(merchantOwner);

    console.log(`Merchant owner balance updated: ${merchantOwner.balance}`);
  }

  /**
   * Release funds to seller's wallet (P2P)
   */
  private async releaseToSeller(payment: Payment): Promise<void> {
    if (!payment.sellerId) {
      throw new BadRequestException('Seller ID is required for P2P payments');
    }

    // Find seller
    const seller = await this.userRepository.findOne({
      where: { id: parseInt(payment.sellerId) }
    });

    if (!seller) {
      throw new NotFoundException(`Seller with ID ${payment.sellerId} not found`);
    }

    console.log(`Releasing ${payment.amount} to seller (User ${seller.id})`);

    // Add funds to seller's wallet
    const currentBalance = parseFloat(seller.balance.toString());
    const paymentAmount = parseFloat(payment.amount.toString());
    seller.balance = currentBalance + paymentAmount;

    await this.userRepository.save(seller);

    console.log(`Seller balance updated: ${seller.balance}`);
  }
}