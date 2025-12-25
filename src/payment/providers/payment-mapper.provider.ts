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
    const userIdString = userId.toString();

    // Determine user role: buyer or seller
    let userRole: 'buyer' | 'seller';
    
    if (payment.buyerId === userIdString) {
      userRole = 'buyer';
    } else if (
      payment.sellerId === userIdString || 
      (payment.merchantId && payment.merchantId === userId)
    ) {
      userRole = 'seller';
    } else {
      userRole = 'buyer'; // Default fallback
    }

    return {
      paymentId: payment.paymentId,
      paymentType: payment.paymentType,
      sellerId: payment.sellerId ? Number(payment.sellerId) : payment.merchantId,
      buyerId: Number(payment.buyerId),
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