// src/outside/providers/callback-processing.provider.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BerryPayCallbackDto } from '../dtos/berrypay-callback.dto';
import { PaymentProvider } from 'src/payment-provider/payment-provider.entity';
import { PaymentSession } from '../entity/payment-session.entity';
import { PaymentSessionStatus } from 'src/common/enums/app.enums';
import { OrderValidationProvider } from './order-validation.provider';
import { BerrypayPaymentMappingProvider } from './berrypay/berrypay-paymentmapping.provider';

@Injectable()
export class CallbackProcessingProvider {
  constructor(
    @InjectRepository(PaymentSession)
    private readonly paymentSessionRepository: Repository<PaymentSession>,
    private readonly orderValidationProvider: OrderValidationProvider,
    private readonly berrypaypaymentMappingProvider: BerrypayPaymentMappingProvider,
  ) { }

  /**
   * Process BerryPay callback and update payment session
   */
  /**
   * Process BerryPay callback and update payment session
   */
  async processCallback(
    provider: PaymentProvider,
    callbackData: BerryPayCallbackDto
  ): Promise<{ status: string; message: string }> {
    console.log('CallbackProcessingProvider: Processing callback');
    console.log('Provider:', provider.name);
    console.log('Order ID:', callbackData.txn_order_id);
    console.log('Transaction Status:', callbackData.txn_status_id);
    console.log('Transaction Message:', callbackData.txn_msg);

    try {
      // Find payment session(s) by order ID
      const paymentSessions = await this.orderValidationProvider.findPaymentSessionsByOrderId(
        callbackData.txn_order_id
      );

      if (paymentSessions.length === 0) {
        console.log('No payment session found for order ID:', callbackData.txn_order_id);
        return {
          status: 'failed',
          message: 'Payment session not found'
        };
      }

      // Get the latest session
      const latestSession = this.getLatestPaymentSession(paymentSessions);
      console.log('Processing latest session ID:', latestSession.id);

      // Determine new status based on transaction status
      const newStatus = this.mapTransactionStatus(callbackData.txn_status_id);
      
      // Update payment session
      await this.updatePaymentSession(latestSession, callbackData, newStatus);

      // If payment is successful, create Payment and PaymentDetails entities
      if (callbackData.txn_msg === 'Payment Successful' && newStatus === PaymentSessionStatus.SUCCESS) {
        console.log('Payment successful - creating Payment and PaymentDetails entities');
        
        try {
          // Check if payment already exists
          const paymentExists = await this.berrypaypaymentMappingProvider.checkIfPaymentExists(latestSession);
          
          if (!paymentExists) {
            await this.berrypaypaymentMappingProvider.createPaymentFromSession(
              latestSession,
              provider,
              callbackData
            );
            console.log('Payment and PaymentDetails entities created successfully');
            
          } else {
            console.log('Payment already exists for this session, skipping creation');
          }
        } catch (paymentError) {
          console.error('Error creating payment entities:', paymentError);
          // Continue with callback processing even if payment creation fails
        }
      }

      console.log('Callback processing successful');
      return {
        status: 'success',
        message: 'Payment session updated successfully'
      };

    } catch (error) {
      console.error('Error processing callback:', error);
      return {
        status: 'failed',
        message: 'Failed to process payment callback'
      };
    }
  }

  /**
   * Get the latest payment session from multiple sessions
   */
  private getLatestPaymentSession(sessions: PaymentSession[]): PaymentSession {
    // Sessions are already ordered by createdAt DESC, so first one is latest
    return sessions[0];
  }

  /**
   * Map BerryPay transaction status to our payment session status
   */
  private mapTransactionStatus(txnStatusId: string): PaymentSessionStatus {
    switch (txnStatusId) {
      case '1': // Payment Successful
        return PaymentSessionStatus.SUCCESS;
      case '0': // Payment Failed
      case '2': // Payment Cancelled
        return PaymentSessionStatus.FAILED;
      case '3': // Payment Pending
        return PaymentSessionStatus.PENDING;
      default:
        console.log('Unknown transaction status:', txnStatusId);
        return PaymentSessionStatus.FAILED;
    }
  }

  /**
   * Update payment session with callback data
   */
  private async updatePaymentSession(
    session: PaymentSession,
    callbackData: BerryPayCallbackDto,
    newStatus: PaymentSessionStatus
  ): Promise<void> {
    console.log('Updating session ID:', session.id);
    console.log('New status:', newStatus);

    // Parse existing payload
    const existingPayload = JSON.parse(session.paymentPayload);

    // Add callback data to payload
    const updatedPayload = {
      ...existingPayload,
      callbackData: {
        txn_status_id: callbackData.txn_status_id,
        txn_ref_id: callbackData.txn_ref_id,
        txn_msg: callbackData.txn_msg,
        txn_date: callbackData.txn_date,
        txn_bank_name: callbackData.txn_bank_name,
        txn_payment_id: callbackData.txn_payment_id,
        txn_amount: callbackData.txn_amount,
        processed_at: new Date().toISOString()
      }
    };

    // Update session
    session.status = newStatus;
    session.paymentPayload = JSON.stringify(updatedPayload);

    await this.paymentSessionRepository.save(session);
    console.log('Payment session updated successfully');
  }
}