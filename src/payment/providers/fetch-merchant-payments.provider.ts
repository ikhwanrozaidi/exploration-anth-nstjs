import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';
import { User } from 'src/users/user.entity';
import { UserPaymentResponse } from '../interface/payment-user.interface';

@Injectable()
export class FetchMerchantPaymentsProvider {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get merchant payments (for Admin users)
   */
async fetchMerchantPayments(userId: number): Promise<UserPaymentResponse[]> {
  console.log('FetchMerchantPaymentsProvider: Getting merchant payments for user ID:', userId);

  try {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.merchantId) {
        throw new NotFoundException('User is not associated with any merchant');
      }

      console.log('Getting merchant payments for merchantId:', user.merchantId);

      // Get all payments for the merchant
      const payments = await this.paymentRepository.find({
        where: { merchantId: user.merchantId },
        relations: ['paymentDetails', 'receiver', 'sender', 'provider'],
        order: { createdAt: 'DESC' }
      });

      // Map payments to response format (all will be marked as 'merchant' role)
     const paymentResponses = payments.map(payment => 
      this.mapPaymentToResponse(payment, userId, user.merchantId)
    );

      console.log(`Found ${paymentResponses.length} merchant payments`);
      return paymentResponses;

    } catch (error) {
      console.error('Error getting merchant payments:', error);
      throw error;
    }
  }

  /**
   * Map payment entity to response format with user role
   */
private mapPaymentToResponse(
  payment: Payment, 
  userId: number,
  userMerchantId: number | null
): UserPaymentResponse {
  let userRole: 'sender' | 'receiver' | 'merchant';

  if (userMerchantId && payment.merchantId === userMerchantId) {
    userRole = 'merchant';
  } else if (payment.buyerId === userId) {
    userRole = 'sender';
  } else if (payment.sellerId === userId) {
    userRole = 'receiver';
  } else {
    userRole = 'sender';
  }

  return {
    paymentId: payment.paymentId,
    paymentType: payment.paymentType,
    receiverId: payment.sellerId?.toString(),
    senderId: payment.buyerId.toString(),
      merchantId: payment.merchantId,
      amount: Number(payment.amount),
      isRequest: payment.isRequest,
      status: payment.status,
      providerId: payment.providerId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      ipAddress: payment.ipAddress,
      userRole,
      paymentDetails: payment.paymentDetails ? {
        signature: payment.paymentDetails.signature,
        productName: payment.paymentDetails.productName,
        productDesc: payment.paymentDetails.productDesc,
        productCat: payment.paymentDetails.productCat,
        amount: Number(payment.paymentDetails.amount),
        buyerName: payment.paymentDetails.buyerName,
        buyerEmail: payment.paymentDetails.buyerEmail,
        buyerPhone: payment.paymentDetails.buyerPhone,
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
      provider: payment.provider ? {
        providerId: payment.provider.providerId,
        name: payment.provider.name,
        publicKey: payment.provider.publicKey,
      } : null,
    };
  }
}