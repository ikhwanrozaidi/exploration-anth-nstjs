// src/auth/providers/otp.provider.ts

import { 
  Injectable, 
  BadRequestException,
  UnauthorizedException,
  Inject,
  Logger 
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OtpCacheData } from '../interfaces/otp-cache.interface';
import { User } from 'src/users/user.entity';

@Injectable()
export class OtpProvider {
  private readonly logger = new Logger(OtpProvider.name);
  private readonly WHITELISTED_EMAILS = ['devimmain@gmail.com', 'testuser2@gatepay.dev'];
  private readonly WHITELISTED_PHONES = ['60133296916', '60173555706'];
  private readonly WHITELIST_OTP = '000000';
  private readonly OTP_EXPIRY = 300; // 5 minutes in seconds
  private readonly RATE_LIMIT = 60; // 60 seconds between requests
  private readonly MAX_ATTEMPTS = 5; // Max verification attempts

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate and send OTP after successful sign-in
   */
  async generateAndSendOtp(user: User): Promise<{ message: string; sentTo: 'email' | 'phone' }> {
    this.logger.log(`Generating OTP for user: ${user.email}`);

    // Check rate limiting
    await this.checkRateLimit(user.email);

    // Determine delivery method (phone takes priority)
    const deliveryMethod = user.phone ? 'phone' : 'email';
    const deliveryTarget = user.phone || user.email;

    // Check if whitelisted
    const isWhitelisted = this.isWhitelisted(user.email, user.phone);
    const otp = isWhitelisted ? this.WHITELIST_OTP : this.generateOtp();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store in cache
    const cacheData: OtpCacheData = {
      otp: hashedOtp,
      userId: user.id,
      email: user.email,
      phone: user.phone,
      createdAt: Date.now(),
      attempts: 0,
      lastRequestAt: Date.now(),
    };

    const cacheKey = this.getCacheKey(user.email);
    await this.cacheManager.set(cacheKey, cacheData, this.OTP_EXPIRY * 1000);

    // Send OTP
    if (isWhitelisted) {
      this.logger.log(`Whitelisted user ${user.email} - OTP: ${otp} (skipped sending)`);
    } else {
      if (deliveryMethod === 'phone') {
        await this.sendOtpViaSms(user.phone, otp);
      } else {
        await this.sendOtpViaEmail(user.email, otp);
      }
    }

    return {
      message: `OTP sent to your ${deliveryMethod}`,
      sentTo: deliveryMethod,
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp(email: string): Promise<{ message: string; sentTo: 'email' | 'phone' }> {
    this.logger.log(`OTP resend requested for: ${email}`);

    // Check if OTP exists
    const cacheKey = this.getCacheKey(email);
    const existingData = await this.cacheManager.get<OtpCacheData>(cacheKey);

    if (!existingData) {
      throw new BadRequestException(
        'No OTP session found. Please sign in again to request OTP.'
      );
    }

    // Check rate limiting
    const timeSinceLastRequest = Date.now() - existingData.lastRequestAt;
    if (timeSinceLastRequest < this.RATE_LIMIT * 1000) {
      const waitTime = Math.ceil((this.RATE_LIMIT * 1000 - timeSinceLastRequest) / 1000);
      throw new BadRequestException(
        `Please wait ${waitTime} seconds before requesting a new OTP`
      );
    }

    // Determine delivery method
    const deliveryMethod = existingData.phone ? 'phone' : 'email';
    const deliveryTarget = existingData.phone || existingData.email;

    // Generate new OTP
    const isWhitelisted = this.isWhitelisted(existingData.email, existingData.phone);
    const otp = isWhitelisted ? this.WHITELIST_OTP : this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update cache
    const cacheData: OtpCacheData = {
      ...existingData,
      otp: hashedOtp,
      createdAt: Date.now(),
      attempts: 0,
      lastRequestAt: Date.now(),
    };

    await this.cacheManager.set(cacheKey, cacheData, this.OTP_EXPIRY * 1000);

    // Send OTP
    if (isWhitelisted) {
      this.logger.log(`Whitelisted user ${email} - OTP: ${otp} (skipped sending)`);
    } else {
      if (deliveryMethod === 'phone') {
        await this.sendOtpViaSms(existingData.phone, otp);
      } else {
        await this.sendOtpViaEmail(existingData.email, otp);
      }
    }

    return {
      message: `OTP resent to your ${deliveryMethod}`,
      sentTo: deliveryMethod,
    };
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<{ userId: number; email: string }> {
    this.logger.log(`OTP verification attempted for: ${email}`);

    const cacheKey = this.getCacheKey(email);
    const cacheData = await this.cacheManager.get<OtpCacheData>(cacheKey);

    // Check if OTP exists
    if (!cacheData) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Check max attempts
    if (cacheData.attempts >= this.MAX_ATTEMPTS) {
      await this.cacheManager.del(cacheKey);
      throw new UnauthorizedException(
        'Maximum verification attempts exceeded. Please sign in again.'
      );
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, cacheData.otp);

    if (!isValid) {
      // Increment attempts
      cacheData.attempts += 1;
      await this.cacheManager.set(cacheKey, cacheData, this.OTP_EXPIRY * 1000);
      
      const remainingAttempts = this.MAX_ATTEMPTS - cacheData.attempts;
      throw new UnauthorizedException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
      );
    }

    // OTP is valid - delete from cache
    await this.cacheManager.del(cacheKey);
    this.logger.log(`OTP verified successfully for: ${email}`);

    return {
      userId: cacheData.userId,
      email: cacheData.email,
    };
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(email: string): Promise<void> {
    const cacheKey = this.getCacheKey(email);
    const existingData = await this.cacheManager.get<OtpCacheData>(cacheKey);

    if (existingData) {
      const timeSinceLastRequest = Date.now() - existingData.lastRequestAt;
      
      if (timeSinceLastRequest < this.RATE_LIMIT * 1000) {
        const waitTime = Math.ceil((this.RATE_LIMIT * 1000 - timeSinceLastRequest) / 1000);
        throw new BadRequestException(
          `Please wait ${waitTime} seconds before requesting a new OTP`
        );
      }
    }
  }

  /**
   * Generate 6-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Check if user is whitelisted (for testing)
   */
  private isWhitelisted(email: string, phone?: string): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const isDevelopmentOrStaging = 
      nodeEnv === 'development' || nodeEnv === 'staging';

    if (!isDevelopmentOrStaging) {
      return false;
    }

    // Check email whitelist
    if (this.WHITELISTED_EMAILS.includes(email)) {
      return true;
    }

    // Check phone whitelist
    if (phone) {
      const normalizedPhone = phone.replace(/[\s\-\+]/g, '');
      if (this.WHITELISTED_PHONES.includes(normalizedPhone)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get cache key for email
   */
  private getCacheKey(email: string): string {
    return `otp:${email}`;
  }

  /**
   * Send OTP via Email (placeholder)
   */
  private async sendOtpViaEmail(email: string, otp: string): Promise<void> {
    // TODO: Integrate with your email service
    this.logger.log(`Sending OTP ${otp} to ${email} via Email`);
    
    // Example integration:
    // await this.emailService.send({
    //   to: email,
    //   subject: 'Your Gatepay OTP Code',
    //   template: 'otp',
    //   context: { otp, expiryMinutes: 5 }
    // });
  }

  /**
   * Send OTP via SMS/WhatsApp (placeholder)
   */
  private async sendOtpViaSms(phone: string, otp: string): Promise<void> {
    // TODO: Integrate with your SMS/WhatsApp service
    this.logger.log(`Sending OTP ${otp} to ${phone} via SMS/WhatsApp`);
    
    // Example integration:
    // await this.smsService.send(phone, `Your Gatepay OTP: ${otp}. Valid for 5 minutes.`);
  }
}