import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import paymentJwtConfig from '../../config/payment-jwt.config';
import { randomBytes } from 'crypto';

export interface PaymentTokenPayload {
  sessionId: number;
  merchantId: number;
  orderId: string;
  jti: string; // JWT ID for additional security
}

@Injectable()
export class SecureTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(paymentJwtConfig.KEY)
    private readonly paymentJwtConfiguration: ConfigType<typeof paymentJwtConfig>,
  ) {}

  /**
   * Generate secure JWT token for payment session
   */
  async generatePaymentToken(sessionId: number, merchantId: number, orderId: string): Promise<string> {
    console.log('SecureTokenProvider: Generating secure payment token');
    console.log('Session ID:', sessionId);
    console.log('Merchant ID:', merchantId);
    console.log('Order ID:', orderId);

    // Generate unique JWT ID for additional security
    const jti = randomBytes(16).toString('hex');

    const payload: PaymentTokenPayload = {
      sessionId,
      merchantId,
      orderId,
      jti
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.paymentJwtConfiguration.secret,
      expiresIn: this.paymentJwtConfiguration.expiresIn,
      issuer: this.paymentJwtConfiguration.issuer,
      audience: this.paymentJwtConfiguration.audience,
    });

    console.log('Secure payment token generated successfully');
    return token;
  }

  /**
   * Verify and decode payment token
   */
  async verifyPaymentToken(token: string): Promise<PaymentTokenPayload> {
    console.log('SecureTokenProvider: Verifying payment token');

    try {
      const payload = await this.jwtService.verifyAsync<PaymentTokenPayload>(token, {
        secret: this.paymentJwtConfiguration.secret,
        issuer: this.paymentJwtConfiguration.issuer,
        audience: this.paymentJwtConfiguration.audience,
      });

      console.log('Payment token verified successfully');
      console.log('Decoded payload:', payload);
      
      return payload;
    } catch (error) {
      console.error('Payment token verification failed:', error.message);
      throw new Error('Invalid or expired payment token');
    }
  }

  /**
   * Extract session ID from token without full verification (for quick checks)
   */
  decodeTokenWithoutVerification(token: string): PaymentTokenPayload | null {
    try {
      return this.jwtService.decode(token) as PaymentTokenPayload;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
}