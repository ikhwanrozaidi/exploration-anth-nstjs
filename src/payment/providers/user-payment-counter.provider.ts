import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';

export interface PaymentCounter {
  completeOrder: number;
  waitReceiveAmount: number;
  completeReceive: number;
  waitReleaseAmount: number;
  completeRelease: number;
}

@Injectable()
export class UserPaymentCounterProvider {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Calculate payment statistics for a user
   * All comparisons use numbers (sellerId, buyerId, merchantId are all numbers)
   */
  async calculateStatistics(
    userId: number,
    payments: Payment[],
  ): Promise<PaymentCounter> {
    console.log('UserPaymentCounterProvider: Calculating statistics for user:', userId);
    console.log('Total payments received:', payments.length);

    // 1. Count ALL completed orders (regardless of buyer/seller role)
    const completeOrder = payments.filter(p => p.isCompleted).length;
    console.log('Complete orders:', completeOrder);

    // 2. User is SELLER (sellerId or merchantId matches userId)
    const sellerPayments = payments.filter(p => 
      p.sellerId === userId || p.merchantId === userId
    );
    console.log('Seller payments count:', sellerPayments.length);

    // Calculate amounts for SELLER role
    const sellerIncompletePayments = sellerPayments.filter(p => !p.isCompleted);
    const sellerCompletePayments = sellerPayments.filter(p => p.isCompleted);

    const waitReceiveAmount = sellerIncompletePayments
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const completeReceive = sellerCompletePayments
      .reduce((sum, p) => sum + Number(p.amount), 0);

    console.log('Seller incomplete payments:', sellerIncompletePayments.length, '- Amount:', waitReceiveAmount);
    console.log('Seller complete payments:', sellerCompletePayments.length, '- Amount:', completeReceive);

    // 3. User is BUYER (buyerId matches userId)
    const buyerPayments = payments.filter(p => p.buyerId === userId);
    console.log('Buyer payments count:', buyerPayments.length);

    // Calculate amounts for BUYER role
    const buyerIncompletePayments = buyerPayments.filter(p => !p.isCompleted);
    const buyerCompletePayments = buyerPayments.filter(p => p.isCompleted);

    const waitReleaseAmount = buyerIncompletePayments
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const completeRelease = buyerCompletePayments
      .reduce((sum, p) => sum + Number(p.amount), 0);

    console.log('Buyer incomplete payments:', buyerIncompletePayments.length, '- Amount:', waitReleaseAmount);
    console.log('Buyer complete payments:', buyerCompletePayments.length, '- Amount:', completeRelease);

    const statistics = {
      completeOrder,
      waitReceiveAmount: Number(waitReceiveAmount.toFixed(2)),
      completeReceive: Number(completeReceive.toFixed(2)),
      waitReleaseAmount: Number(waitReleaseAmount.toFixed(2)),
      completeRelease: Number(completeRelease.toFixed(2)),
    };

    console.log('Final statistics:', statistics);

    return statistics;
  }
}