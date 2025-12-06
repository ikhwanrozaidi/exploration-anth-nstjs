// src/outside/providers/order-validation.provider.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSession } from '../entity/payment-session.entity';

@Injectable()
export class OrderValidationProvider {
  constructor(
    @InjectRepository(PaymentSession)
    private readonly paymentSessionRepository: Repository<PaymentSession>,
  ) {}

  /**
   * Validate order ID uniqueness per merchant in PaymentSession
   */
  async validateOrderId(orderId: string, merchantId: number): Promise<boolean> {
    console.log('OrderValidationProvider: Validating order ID uniqueness');
    console.log('Order ID:', orderId);
    console.log('Merchant ID:', merchantId);

    try {
      // Query PaymentSession to check if orderId exists for this merchant
      // Use quoted column name to handle camelCase properly
      const existingSession = await this.paymentSessionRepository
        .createQueryBuilder('session')
        .where('session.merchantId = :merchantId', { merchantId })
        .andWhere(`session."paymentPayload"::json->>'orderId' = :orderId`, { orderId })
        .getOne();

      if (existingSession) {
        console.log('Order ID already exists for this merchant');
        console.log('Existing session ID:', existingSession.id);
        throw new BadRequestException('Access denied');
      }

      console.log('Order ID validation passed - unique for this merchant');
      return true;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw validation errors
      }
      
      console.error('Error during order ID validation:', error);
      throw new BadRequestException('Access denied');
    }
  }

  /**
   * Find existing payment sessions by order ID and merchant ID
   */
  async findPaymentSessionsByOrderId(orderId: string, merchantId?: number): Promise<PaymentSession[]> {
    console.log('OrderValidationProvider: Finding sessions by order ID');
    console.log('Order ID:', orderId);
    console.log('Merchant ID:', merchantId || 'All merchants');

    try {
      let query = this.paymentSessionRepository
        .createQueryBuilder('session')
        .where(`session."paymentPayload"::json->>'orderId' = :orderId`, { orderId });

      // If merchantId is provided, filter by it
      if (merchantId) {
        query = query.andWhere('session.merchantId = :merchantId', { merchantId });
      }

      const sessions = await query
        .orderBy('session.createdAt', 'DESC')
        .getMany();

      console.log(`Found ${sessions.length} sessions for order ID: ${orderId}`);
      return sessions;

    } catch (error) {
      console.error('Error finding payment sessions:', error);
      return [];
    }
  }
}