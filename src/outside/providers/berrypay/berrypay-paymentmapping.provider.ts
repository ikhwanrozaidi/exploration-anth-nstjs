// src/outside/providers/payment-mapping.provider.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentStatus, PaymentType, UserRole, UserStatus } from 'src/common/enums/app.enums';
import { BerryPayCallbackDto } from 'src/outside/dtos/berrypay-callback.dto';
import { PaymentSession } from 'src/outside/entity/payment-session.entity';
import { PaymentProvider } from 'src/payment-provider/payment-provider.entity';
import { PaymentDetails } from 'src/payment/entity/payment-details.entity';
import { Payment } from 'src/payment/payment.entity';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BerrypayPaymentMappingProvider {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentDetails)
    private readonly paymentDetailsRepository: Repository<PaymentDetails>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create Payment and PaymentDetails from successful PaymentSession
   */
  async createPaymentFromSession(
    paymentSession: PaymentSession,
    provider: PaymentProvider,
    callbackData: BerryPayCallbackDto
  ): Promise<Payment> {
    console.log('PaymentMappingProvider: Creating payment from session');
    console.log('Session ID:', paymentSession.id);
    console.log('Provider:', provider.name);

    try {
      // Parse payment payload
      const paymentPayload = JSON.parse(paymentSession.paymentPayload);
      console.log('Payment payload parsed');

      // Find or create sender user by buyer email from callback
      const senderUser = await this.findOrCreateUserByEmail(
        callbackData.txn_buyer_email,
        callbackData.txn_buyer_phone,
        callbackData.txn_buyer_name
      );

      // Create Payment entity
      const payment = await this.createPaymentEntity(
        paymentSession,
        provider,
        senderUser,
        paymentPayload,
        callbackData
      );

      // Create PaymentDetails entity
      await this.createPaymentDetailsEntity(payment, paymentPayload);

      console.log('Payment and PaymentDetails created successfully');
      console.log('Payment ID:', payment.paymentId);

      return payment;

    } catch (error) {
      console.error('Error creating payment from session:', error);
      throw error;
    }
  }

  /**
   * Find user by email or create if not exists
   */
  private async findOrCreateUserByEmail(email: string, phone?: string, name?: string): Promise<User> {
    console.log('Finding or creating user for email:', email);
    
    let user = await this.userRepository.findOne({
      where: { email }
    });

    if (user) {
      console.log('Found existing user ID:', user.id, 'for email:', email);
      return user;
    }

    // User doesn't exist, create new one
    console.log('User not found, creating new user for email:', email);
    
    try {
      // Generate next ID for user
      const nextUserId = await this.generateNextUserIdForCallback();
      
      const newUser = this.userRepository.create({
        id: nextUserId,
        email: email,
        phone: phone || null,
        password: 'callback_user_' + Date.now(), // Temporary password
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      const savedUser = await this.userRepository.save(newUser);
      console.log('Created new user ID:', savedUser.id, 'for email:', email);
      
      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user for email: ${email}`);
    }
  }

  /**
   * Generate next ID for callback users
   */
  private async generateNextUserIdForCallback(): Promise<number> {
    try {
      // Find highest user ID (excluding role-based IDs)
      const result = await this.userRepository
        .createQueryBuilder('user')
        .select('MAX(user.id)', 'maxId')
        .where('user.id < :threshold', { threshold: 100000 })
        .andWhere('user.id NOT BETWEEN :start1 AND :end1', { start1: 140000, end1: 149999 })
        .andWhere('user.id NOT BETWEEN :start2 AND :end2', { start2: 150000, end2: 159999 })
        .andWhere('user.id NOT BETWEEN :start3 AND :end3', { start3: 440000, end3: 449999 })
        .getRawOne();

      const maxId = result?.maxId;
      const nextId = (maxId || 0) + 1;
      
      console.log('Generated user ID for callback:', nextId);
      return nextId;
    } catch (error) {
      console.error('Error generating user ID:', error);
      throw error;
    }
  }

  /**
   * Create Payment entity
   */
  private async createPaymentEntity(
    paymentSession: PaymentSession,
    provider: PaymentProvider,
    senderUser: User,
    paymentPayload: any,
    callbackData: BerryPayCallbackDto
  ): Promise<Payment> {
    console.log('Creating Payment entity');

    const payment = this.paymentRepository.create({
      paymentType: PaymentType.GATEWAY, // Set to GATEWAY since it has merchantId
      sellerId: null, // Set to null as specified
      buyerId: senderUser.id.toString(), // Convert to string
      merchantId: paymentSession.merchantId,
      amount: parseFloat(paymentPayload.productAmount),
      isRequest: false, // Set to false since it has merchantId
      status: PaymentStatus.SUCCESS, // Set to SUCCESS for successful payment
      providerId: provider.providerId,
      ipAddress: null, // Could be extracted from request if available
    });

    const savedPayment = await this.paymentRepository.save(payment);
    console.log('Payment entity created with ID:', savedPayment.paymentId);

    return savedPayment;
  }

  /**
   * Create PaymentDetails entity
   */
  private async createPaymentDetailsEntity(
    payment: Payment,
    paymentPayload: any
  ): Promise<PaymentDetails> {
    console.log('Creating PaymentDetails entity');

    const paymentDetails = this.paymentDetailsRepository.create({
      paymentId: payment.paymentId,
      signature: paymentPayload.signature,
      productName: paymentPayload.productName,
      productDesc: paymentPayload.productDesc || null,
      productCat: paymentPayload.productCat || null,
      amount: parseFloat(paymentPayload.productAmount),
      buyerName: paymentPayload.buyerName,
      buyerEmail: paymentPayload.buyerAccount,
      buyerPhone: paymentPayload.buyerPhone?.toString() || null,
      refundable: paymentPayload.isRefundable || false,
    });

    const savedPaymentDetails = await this.paymentDetailsRepository.save(paymentDetails);
    console.log('PaymentDetails entity created for payment ID:', savedPaymentDetails.paymentId);

    return savedPaymentDetails;
  }

  /**
   * Check if payment already exists for this session
   */
  async checkIfPaymentExists(paymentSession: PaymentSession): Promise<boolean> {
    const paymentPayload = JSON.parse(paymentSession.paymentPayload);
    
    // Check if payment already exists based on order ID and merchant ID
    const existingPayment = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.paymentDetails', 'details')
      .where('payment.merchantId = :merchantId', { merchantId: paymentSession.merchantId })
      .andWhere('details.productName = :productName', { productName: paymentPayload.productName })
      .andWhere('details.buyerEmail = :buyerEmail', { buyerEmail: paymentPayload.buyerAccount })
      .andWhere('details.amount = :amount', { amount: paymentPayload.productAmount })
      .getOne();

    const exists = !!existingPayment;
    console.log('Payment exists check:', exists);
    
    return exists;
  }
}