import { Injectable } from '@nestjs/common';
import { Payment } from '../payment.entity';
import { UserPaymentTransaction } from '../interface/payment-user-summary.interface';

@Injectable()
export class PaymentMapperProvider {
  /**
   * Map payment entity to transaction response
   */
  mapPaymentToTransaction(
    payment: Payment,
    userId: number,
  ): UserPaymentTransaction {
    // ✅ No string conversion needed - compare numbers directly

    // Determine user role: buyer or seller
    let userRole: 'buyer' | 'seller';
    
    if (payment.buyerId === userId) {  // ✅ Number comparison
      userRole = 'buyer';
    } else if (
      payment.sellerId === userId ||  // ✅ Number comparison
      payment.merchantId === userId   // ✅ Number comparison
    ) {
      userRole = 'seller';
    } else {
      userRole = 'buyer'; // Default fallback
    }

    return {
      paymentId: payment.paymentId,
      paymentType: payment.paymentType,
      sellerId: payment.sellerId || payment.merchantId,  // ✅ Already a number
      buyerId: payment.buyerId,  // ✅ Already a number
      merchantId: payment.merchantId,
      amount: Number(payment.amount),
      providerId: payment.providerId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      userRole,
      paymentDetails: payment.paymentDetails ? {
        productName: payment.paymentDetails.productName,
        productDesc: payment.paymentDetails.productDesc,
        productCat: payment.paymentDetails.productCat,
        amount: Number(payment.paymentDetails.amount),
        refundable: payment.paymentDetails.refundable,
      } : null,
      seller: payment.seller ? {
        id: payment.seller.id,
        email: payment.seller.email,
      } : null,
      buyer: payment.buyer ? {
        id: payment.buyer.id,
        email: payment.buyer.email,
      } : null,
    };
  }

  /**
   * Map multiple payments to transactions
   */
  mapPaymentsToTransactions(
    payments: Payment[],
    userId: number,
  ): UserPaymentTransaction[] {
    return payments.map(payment => 
      this.mapPaymentToTransaction(payment, userId)
    );
  }
}