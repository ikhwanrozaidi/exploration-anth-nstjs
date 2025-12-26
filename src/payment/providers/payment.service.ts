import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';
import { User } from 'src/users/user.entity';
import { FetchMerchantPaymentsProvider } from './fetch-merchant-payments.provider';
import { FetchUserPaymentsProvider } from './fetch-user-payments.provider';
import { UserPaymentResponse } from '../interface/payment-user.interface';
import { UserPaymentSummary } from '../interface/payment-user-summary.interface';
import { GetUserPaymentsQueryDto } from '../dtos/get-user-payments-query.dto';
import { CompletePaymentProvider } from './complete-payment.provider';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly fetchMerchantPaymentsProvider: FetchMerchantPaymentsProvider,

    private readonly fetchUserPaymentsProvider: FetchUserPaymentsProvider,

    private readonly completePaymentProvider: CompletePaymentProvider,
  ) {}

  /**
   * Get merchant payments (for Admin users)
   */
  async getMerchantPayments(userId: number): Promise<UserPaymentResponse[]> {
    return await this.fetchMerchantPaymentsProvider.fetchMerchantPayments(userId);
  }

  /**
   * Get personal payments with summary statistics
   */
  async getPersonalPayments(
    userId: number,
    queryDto: GetUserPaymentsQueryDto,
  ): Promise<UserPaymentSummary> {
    return await this.fetchUserPaymentsProvider.fetchUserPayments(userId, queryDto);
  }

  /**
   * Complete payment with proof images
   */
  async completePayment(
    userId: number,
    paymentId: string,
    proofImages: Express.Multer.File[],
  ) {
    return await this.completePaymentProvider.completePayment(
      userId,
      paymentId,
      proofImages,
    );
  }

  /**
   * Mark payment as complete (for testing/admin purposes)
   * All comparisons use numbers (sellerId, buyerId, merchantId are all numbers)
   */
  async markPaymentComplete(userId: number, paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentId },
      relations: ['seller', 'buyer'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Only seller can mark as complete
    if (payment.sellerId !== userId && payment.merchantId !== userId) {
      throw new ForbiddenException('Only seller can mark payment as completed');
    }

    payment.isCompleted = true;
    return await this.paymentRepository.save(payment);
  }
}