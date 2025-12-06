// src/outside/outside.service.ts
import { Injectable } from '@nestjs/common';
import { PaymentProcessingProvider } from './payment-processing.provider';
import { PaymentRequestDto } from '../dtos/payment-request.dto';
import { PaymentSessionProvider } from './payment-session.provider';
import { TokenValidationResponseDto } from '../dtos/token-validation-response.dto';
import { SubmitPaymentDto } from '../dtos/submit-payment.dto';
import { PaymentSessionStatus } from 'src/common/enums/app.enums';
import { BerryPayProvider } from './berrypay/berrypay.provider';
import { BerryPayCallbackDto } from '../dtos/berrypay-callback.dto';
import { PaymentProviderValidationProvider } from './security/paymentprovider-validation.provider';
import { CallbackProcessingProvider } from './callback-processing.provider';

@Injectable()
export class OutsideService {
  constructor(
    private readonly paymentProcessingProvider: PaymentProcessingProvider,

    private readonly paymentSessionProvider: PaymentSessionProvider,

    private readonly berryPayProvider: BerryPayProvider,

    private readonly paymentProviderValidationProvider: PaymentProviderValidationProvider,

    private readonly callbackProcessingProvider: CallbackProcessingProvider,
  ) { }

  public async createPaymentRequest(companyId: number, paymentRequest: PaymentRequestDto): Promise<string> {
    return await this.paymentProcessingProvider.processPaymentRequest(companyId, paymentRequest);
  }

  public async validateToken(token: string): Promise<TokenValidationResponseDto> {
    try {
      const paymentSession = await this.paymentSessionProvider.validateTokenAndGetSession(token);

      const paymentPayload = JSON.parse(paymentSession.paymentPayload);

      return {
        status: 'valid',
        sessionId: paymentSession.id,
        merchantName: paymentSession.merchant.name,
        paymentData: {
          buyerAccount: paymentPayload.buyerAccount,
          buyerPhone: paymentPayload.buyerPhone,
          buyerName: paymentPayload.buyerName,
          orderId: paymentPayload.orderId,
          productName: paymentPayload.productName,
          productDesc: paymentPayload.productDesc,
          productAmount: paymentPayload.productAmount,
          isRefundable: paymentPayload.isRefundable,
          productCat: paymentPayload.productCat,
          returnUrl: paymentPayload.returnUrl,
        },
        expiresAt: paymentSession.expiresAt,
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return {
        status: 'invalid'
      };
    }
  }

  public async submitPayment(token: string, submitPaymentDto: SubmitPaymentDto): Promise<{ status: string; message: string; data?: any }> {
    try {
      // Step 1: Validate token again
      const paymentSession = await this.paymentSessionProvider.validateTokenAndGetSession(token);

      // Step 2: Create user with gate email and phone
      await this.paymentSessionProvider.createGateUser(submitPaymentDto);

      // Step 3: Get original payment data
      const paymentPayload = JSON.parse(paymentSession.paymentPayload);

      // Step 4: Call BerryPay API
      console.log('Calling BerryPay API...');
      const berryPayResult = await this.berryPayProvider.processPayment(paymentPayload);

      if (berryPayResult.success) {
        // Step 5a: Update session status to PASSED
        await this.paymentSessionProvider.updateSessionStatus(paymentSession.id, PaymentSessionStatus.PASSED);

        return {
          status: 'success',
          message: 'Payment processed successfully',
          data: String(berryPayResult.data)
        };
      } else {
        // Step 5b: Update session status to UNPASSED
        await this.paymentSessionProvider.updateSessionStatus(paymentSession.id, PaymentSessionStatus.UNPASSED);

        return {
          status: 'failed',
          message: berryPayResult.error || 'Payment processing failed'
        };
      }

    } catch (error) {
      console.error('Submit payment failed:', error);

      // Try to update session status to UNPASSED if we have session info
      try {
        const paymentSession = await this.paymentSessionProvider.validateTokenAndGetSession(token);
        await this.paymentSessionProvider.updateSessionStatus(paymentSession.id, PaymentSessionStatus.UNPASSED);
      } catch (updateError) {
        console.error('Failed to update session status:', updateError);
      }

      return {
        status: 'failed',
        message: 'Payment submission failed'
      };
    }
  }

  public async processCallback(publicKey: number, callbackData: BerryPayCallbackDto): Promise<{ status: string; message: string }> {
    try {
      // Step 1: Validate payment provider
      const provider = await this.paymentProviderValidationProvider.validateProvider(publicKey);

      // Step 2: Process callback
      return await this.callbackProcessingProvider.processCallback(provider, callbackData);

    } catch (error) {
      console.error('Callback processing failed:', error);
      return {
        status: 'failed',
        message: 'Callback validation failed'
      };
    }
  }

  public async getTokenStatus(token: string): Promise<{ status: string }> {
  try {
    // Validate token and get session
    const paymentSession = await this.paymentSessionProvider.validateTokenAndGetSession(token);
    
    return {
      status: paymentSession.status
    };
    
  } catch (error) {
    console.error('Token status check failed:', error);
    return {
      status: 'invalid'
    };
  }
}
}