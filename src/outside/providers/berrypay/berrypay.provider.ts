import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createHmac } from 'crypto';
import berrypayConfig from '../../config/berrypay.config';

export interface BerryPayRequest {
  secret_key: string;
  api_key: string;
  txn_amount: string;
  txn_buyer_email: string;
  txn_buyer_name: string;
  txn_buyer_phone: string;
  txn_order_id: string;
  txn_product_desc: string;
  txn_product_name: string;
  signature: string;
}

@Injectable()
export class BerryPayProvider {
  constructor(
    @Inject(berrypayConfig.KEY)
    private readonly berrypayConfiguration: ConfigType<typeof berrypayConfig>,
  ) {}

  /**
   * Generate BerryPay signature
   */
  private generateSignature(
    apiKey: string,
    amount: string,
    buyerEmail: string,
    buyerName: string,
    buyerPhone: string,
    orderId: string,
    productDesc: string,
    productName: string,
    secretKey: string
  ): string {
    const stringConcat = `${apiKey}|${amount}|${buyerEmail}|${buyerName}|${buyerPhone}|${orderId}|${productDesc}|${productName}`;
    return createHmac('sha256', secretKey).update(stringConcat).digest('hex');
  }

  /**
   * Call BerryPay API
   */
  async processPayment(paymentData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('BerryPayProvider: Processing payment with BerryPay');

    try {
      // Prepare BerryPay request
      const berryPayRequest: BerryPayRequest = {
        secret_key: this.berrypayConfiguration.secretKey,
        api_key: this.berrypayConfiguration.apiKey,
        txn_amount: paymentData.productAmount.toString(),
        txn_buyer_email: paymentData.buyerAccount,
        txn_buyer_name: paymentData.buyerName,
        txn_buyer_phone: paymentData.buyerPhone.toString(),
        txn_order_id: paymentData.orderId,
        txn_product_desc: paymentData.productDesc,
        txn_product_name: paymentData.productName,
        signature: '', // Will be generated
      };

      // Generate signature
      berryPayRequest.signature = this.generateSignature(
        berryPayRequest.api_key,
        berryPayRequest.txn_amount,
        berryPayRequest.txn_buyer_email,
        berryPayRequest.txn_buyer_name,
        berryPayRequest.txn_buyer_phone,
        berryPayRequest.txn_order_id,
        berryPayRequest.txn_product_desc,
        berryPayRequest.txn_product_name,
        berryPayRequest.secret_key
      );

      console.log('Generated signature:', berryPayRequest.signature);

      // Prepare form data for x-www-form-urlencoded
      const formData = new URLSearchParams();
      Object.keys(berryPayRequest).forEach(key => {
        formData.append(key, berryPayRequest[key]);
      });

      // Build full URL with public key
      const fullUrl = `${this.berrypayConfiguration.apiUrl}/${this.berrypayConfiguration.publicKey}`;
      console.log('Calling BerryPay URL:', fullUrl);

      // Make API call
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseData = await response.text();
      console.log('BerryPay response:', responseData);

      if (response.ok) {
        return {
          success: true,
          data: responseData
        };
      } else {
        return {
          success: false,
          error: `BerryPay API error: ${response.status} - ${responseData}`
        };
      }

    } catch (error) {
      console.error('BerryPay API call failed:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }
}