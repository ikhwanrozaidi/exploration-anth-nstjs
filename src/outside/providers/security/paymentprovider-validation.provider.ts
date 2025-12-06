// src/outside/providers/payment-provider-validation.provider.ts
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderStatus } from 'src/common/enums/app.enums';
import { PaymentProvider } from 'src/payment-provider/payment-provider.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentProviderValidationProvider {
  constructor(
    @InjectRepository(PaymentProvider)
    private readonly paymentProviderRepository: Repository<PaymentProvider>,
  ) {}

  /**
   * Validate payment provider by public key
   */
  async validateProvider(publicKey: number): Promise<PaymentProvider> {
    console.log('PaymentProviderValidationProvider: Validating provider');
    console.log('Public Key:', publicKey);

    const provider = await this.paymentProviderRepository.findOne({
      where: { publicKey }
    });

    if (!provider) {
      console.log('Payment provider not found');
      throw new UnauthorizedException('Invalid payment provider');
    }

    if (provider.status !== ProviderStatus.ACTIVE) {
      console.log('Payment provider is not active. Status:', provider.status);
      throw new UnauthorizedException('Payment provider is not active');
    }

    // Check if provider is expired
    const currentDate = new Date();
    if (provider.expiryDate && currentDate > provider.expiryDate) {
      console.log('Payment provider has expired');
      throw new UnauthorizedException('Payment provider has expired');
    }

    console.log('Payment provider validation successful:', provider.name);
    return provider;
  }
}