import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentRequestDto } from '../dtos/payment-request.dto';
import { SecureTokenProvider } from './security/secure-token.provider';
import { PaymentSession } from '../entity/payment-session.entity';
import { Merchant } from 'src/merchant/merchant.entity';
import { PaymentSessionStatus, UserRole, UserStatus } from 'src/common/enums/app.enums';
import { SubmitPaymentDto } from '../dtos/submit-payment.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class PaymentSessionProvider {
  constructor(
    @InjectRepository(PaymentSession)
    private readonly paymentSessionRepository: Repository<PaymentSession>,

    private readonly secureTokenProvider: SecureTokenProvider,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Create new payment session with secure token
   */
  async createPaymentSession(
    merchant: Merchant,
    paymentRequest: PaymentRequestDto,
    originalSessionId?: number
  ): Promise<{ paymentSession: PaymentSession; paymentUrl: string }> {
    console.log('PaymentSessionProvider: Creating payment session');

    try {
      // Calculate expiration time (10 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Create payment session without token first
      const paymentSession = this.paymentSessionRepository.create({
        merchantId: merchant.merchantId,
        paymentPayload: JSON.stringify(paymentRequest),
        status: PaymentSessionStatus.PENDING,
        expiresAt,
        originalSessionId,
        token: 'temp', // Temporary placeholder
      });

      // Save to get the ID
      const savedSession = await this.paymentSessionRepository.save(paymentSession);
      console.log('Payment session created with ID:', savedSession.id);

      // Generate secure JWT token using the session ID
      const secureToken = await this.secureTokenProvider.generatePaymentToken(
        savedSession.id,
        merchant.merchantId,
        paymentRequest.orderId
      );

      // Update session with the actual token
      savedSession.token = secureToken;
      const finalSession = await this.paymentSessionRepository.save(savedSession);

      // Generate payment URL
      const paymentUrl = `pay.gatepay.dev/${secureToken}`;

      console.log('Payment session created successfully');
      console.log('Payment URL:', paymentUrl);

      return {
        paymentSession: finalSession,
        paymentUrl
      };

    } catch (error) {
      console.error('Error creating payment session:', error);
      throw error;
    }
  }


  /**
 * Validate token and retrieve payment session
 */
  async validateTokenAndGetSession(token: string): Promise<PaymentSession> {
    console.log('PaymentSessionProvider: Validating token and retrieving session');

    try {
      // Step 1: Verify JWT token
      const tokenPayload = await this.secureTokenProvider.verifyPaymentToken(token);

      // Step 2: Find payment session by ID from token
      const paymentSession = await this.paymentSessionRepository.findOne({
        where: {
          id: tokenPayload.sessionId,
          token: token // Additional security check
        },
        relations: ['merchant']
      });

      if (!paymentSession) {
        throw new NotFoundException('Payment session not found');
      }

      // Step 3: Check if session is expired
      if (new Date() > paymentSession.expiresAt) {
        // Update status to expired
        paymentSession.status = PaymentSessionStatus.EXPIRED;
        await this.paymentSessionRepository.save(paymentSession);
        throw new Error('Payment session has expired');
      }

      // Step 4: Verify token data matches session data
      if (tokenPayload.merchantId !== paymentSession.merchantId) {
        throw new Error('Token merchant ID mismatch');
      }

      const paymentPayload = JSON.parse(paymentSession.paymentPayload);
      if (tokenPayload.orderId !== paymentPayload.orderId) {
        throw new Error('Token order ID mismatch');
      }

      // Step 5: Update status to INITIATE when token is successfully validated
      if (paymentSession.status === PaymentSessionStatus.PENDING) {
        paymentSession.status = PaymentSessionStatus.INITIATE;
        await this.paymentSessionRepository.save(paymentSession);
        console.log('Payment session status updated to INITIATE');
      }

      console.log('Token validation successful');
      return paymentSession;

    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  }

  /**
   * Update payment session status
   */
  async updateSessionStatus(sessionId: number, status: PaymentSessionStatus): Promise<PaymentSession> {
    console.log('PaymentSessionProvider: Updating session status');
    console.log('Session ID:', sessionId);
    console.log('New Status:', status);

    const session = await this.paymentSessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('Payment session not found');
    }

    session.status = status;
    const updatedSession = await this.paymentSessionRepository.save(session);

    console.log('Session status updated successfully');
    return updatedSession;
  }

  /**
   * Create retry session for failed payments (for future email notifications)
   */
  async createRetrySession(originalSessionId: number): Promise<{ paymentSession: PaymentSession; paymentUrl: string }> {
    console.log('PaymentSessionProvider: Creating retry session');

    // Get original session
    const originalSession = await this.paymentSessionRepository.findOne({
      where: { id: originalSessionId },
      relations: ['merchant']
    });

    if (!originalSession) {
      throw new NotFoundException('Original payment session not found');
    }

    // Parse original payload
    const originalPayload = JSON.parse(originalSession.paymentPayload);

    // Create new session with same payload
    return await this.createPaymentSession(
      originalSession.merchant,
      originalPayload,
      originalSessionId
    );
  }

  /**
   * Pre-register from payment submission
   */
  /**
 * Create gate user from payment submission
 */
async createGateUser(submitPaymentDto: SubmitPaymentDto): Promise<void> {
  console.log('PaymentSessionProvider: Creating gate user');
  
  try {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: submitPaymentDto.buyerGateEmail },
        { phone: submitPaymentDto.buyerGatePhone.toString() }
      ]
    });

    if (existingUser) {
      console.log('User already exists, skipping creation');
      return;
    }

    // Generate next ID for USER role using your existing ID generation system
    const nextUserId = await this.generateNextUserIdForGate();

    // Create new user with generated ID
    const newUser = this.userRepository.create({
      id: nextUserId, // Use generated ID
      email: submitPaymentDto.buyerGateEmail,
      phone: submitPaymentDto.buyerGatePhone.toString(),
      password: 'temp_password_' + Date.now(), // Temporary password
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(newUser);
    console.log('Gate user created successfully with ID:', nextUserId);
    
  } catch (error) {
    console.error('Error creating gate user:', error);
    throw error;
  }
}

/**
 * Generate next ID for gate users (simple implementation)
 */
private async generateNextUserIdForGate(): Promise<number> {
  try {
    // Find highest ID that doesn't start with role prefixes (44, 14, 15)
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('MAX(user.id)', 'maxId')
      .where('user.id < :threshold', { threshold: 100000 }) // IDs below 100000 are regular users
      .andWhere('user.id NOT BETWEEN :start1 AND :end1', { start1: 140000, end1: 149999 }) // Not admin range
      .andWhere('user.id NOT BETWEEN :start2 AND :end2', { start2: 150000, end2: 159999 }) // Not staff range
      .andWhere('user.id NOT BETWEEN :start3 AND :end3', { start3: 440000, end3: 449999 }) // Not superadmin range
      .getRawOne();

    const maxId = result?.maxId;

    if (!maxId || maxId === null) {
      return 1; // Start from 1 for users
    }

    return maxId + 1;
  } catch (error) {
    console.error('Error generating user ID:', error);
    throw error;
  }
}
}