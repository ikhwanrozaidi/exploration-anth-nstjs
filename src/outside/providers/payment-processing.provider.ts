import { Injectable } from '@nestjs/common';
import { PaymentRequestDto } from '../dtos/payment-request.dto';
import { MerchantValidationProvider } from './security/merchant-validation.provider';
import { OrderValidationProvider } from './order-validation.provider';
import { Merchant } from 'src/merchant/merchant.entity';
import { PaymentSessionProvider } from './payment-session.provider';
import { SignatureValidationProvider } from './security/signature-validation.provider';

@Injectable()
export class PaymentProcessingProvider {
  constructor(
    private readonly merchantValidationProvider: MerchantValidationProvider,
    private readonly signatureValidationProvider: SignatureValidationProvider,
    private readonly orderValidationProvider: OrderValidationProvider,
    private readonly paymentSessionProvider: PaymentSessionProvider,
  ) {}

  /**
   * Process payment request with full validation and secure token generation
   */
  async processPaymentRequest(companyId: number, paymentRequest: PaymentRequestDto): Promise<string> {
    console.log('PaymentProcessingProvider: Starting payment request processing');

    try {
      // Step 1: Validate merchant credentials
      const merchant = await this.merchantValidationProvider.validateMerchant(
        companyId,
        paymentRequest.secretKey,
        paymentRequest.apiKey
      );

      // Step 2: Validate signature
      this.signatureValidationProvider.validateSignature(paymentRequest, merchant.secretKey);

      // Step 3: Validate order ID uniqueness
      await this.orderValidationProvider.validateOrderId(paymentRequest.orderId, merchant.merchantId);

      // Step 4: Create payment session with secure token
      const { paymentUrl } = await this.paymentSessionProvider.createPaymentSession(
        merchant,
        paymentRequest
      );

      console.log('Payment request processing successful');
      return paymentUrl;

    } catch (error) {
      console.error('Payment request processing failed:', error);
      throw error;
    }
  }

//   /**
//    * Generate payment token (placeholder implementation)
//    */
//   private generatePaymentToken(paymentRequest: PaymentRequestDto, merchant: Merchant): string {
//     // TODO: Implement actual token generation logic
//     // This could involve:
//     // 1. Creating a payment record in database
//     // 2. Generating a secure random token
//     // 3. Setting expiration time
//     // 4. Storing token-to-payment mapping

//     const timestamp = Date.now();
//     const random = Math.random().toString(36).substring(2, 15);
//     const token = `${merchant.merchantId}_${timestamp}_${random}`;
    
//     console.log('Generated payment token:', token);
//     return token;
//   }
}