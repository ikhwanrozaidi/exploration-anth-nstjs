// src/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';
import { User } from 'src/users/user.entity';
import { UserPaymentResponse } from '../interface/payment-user.interface';



@Injectable()
export class PaymentService {
  constructor(

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}



  /**
   * Get merchant payments (for Admin users)
   */
  async getMerchantPayments(userId: number): Promise<UserPaymentResponse[]> {
    console.log('PaymentService: Getting merchant payments for user ID:', userId);

    try {
      // Get user details to check merchant ID
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.merchantId) {
        throw new Error('User is not associated with any merchant');
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
        this.mapPaymentToResponse(payment, userId.toString(), user.merchantId)
      );

      console.log(`Found ${paymentResponses.length} merchant payments`);
      return paymentResponses;

    } catch (error) {
      console.error('Error getting merchant payments:', error);
      throw error;
    }
  }

  /**
 * Get personal payments (for regular Users)
 */
async getPersonalPayments(userId: number): Promise<UserPaymentResponse[]> {
  console.log('PaymentService: Getting personal payments for user ID:', userId);

  try {
    // Get user details
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    console.log('Getting personal payments for userId:', userId);

    // Convert userId to string for comparison with senderId/receiverId
    const userIdString = userId.toString();

    // Get payments where user is sender or receiver
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.paymentDetails', 'paymentDetails')
      .leftJoinAndSelect('payment.receiver', 'receiver')
      .leftJoinAndSelect('payment.sender', 'sender')
      .leftJoinAndSelect('payment.provider', 'provider')
      .where('payment.senderId = :userId OR payment.receiverId = :userId', { 
        userId: userIdString 
      })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    console.log(`Query executed with userId: ${userIdString}`);
    console.log(`Raw query result count: ${payments.length}`);

    // Debug: Log the first payment if exists
    if (payments.length > 0) {
      console.log('First payment details:');
      console.log('Payment ID:', payments[0].paymentId);
      console.log('Sender ID:', payments[0].senderId);
      console.log('Receiver ID:', payments[0].receiverId);
    }

    // Map payments to response format with user role
    const paymentResponses = payments.map(payment => 
      this.mapPaymentToResponse(payment, userIdString, null)
    );

    console.log(`Found ${paymentResponses.length} personal payments`);
    return paymentResponses;

  } catch (error) {
    console.error('Error getting personal payments:', error);
    throw error;
  }
}

  /**
   * Map payment entity to response format with user role
   */
  private mapPaymentToResponse(
    payment: Payment, 
    userId: string, 
    userMerchantId: number | null
  ): UserPaymentResponse {
    let userRole: 'sender' | 'receiver' | 'merchant';

    if (userMerchantId && payment.merchantId === userMerchantId) {
      userRole = 'merchant';
    } else if (payment.senderId === userId) {
      userRole = 'sender';
    } else if (payment.receiverId === userId) {
      userRole = 'receiver';
    } else {
      userRole = 'sender';
    }

    return {
      paymentId: payment.paymentId,
      paymentType: payment.paymentType,
      receiverId: payment.receiverId,
      senderId: payment.senderId,
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
      receiver: payment.receiver ? {
        id: payment.receiver.id,
        email: payment.receiver.email,
      } : null,
      sender: payment.sender ? {
        id: payment.sender.id,
        email: payment.sender.email,
      } : null,
      provider: payment.provider ? {
        providerId: payment.provider.providerId,
        name: payment.provider.name,
        publicKey: payment.provider.publicKey,
      } : null,
    };
  }
}