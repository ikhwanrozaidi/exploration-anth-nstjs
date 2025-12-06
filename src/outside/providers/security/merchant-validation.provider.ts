import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MerchantStatus } from 'src/common/enums/app.enums';
import { Merchant } from 'src/merchant/merchant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MerchantValidationProvider {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  /**
   * Validate merchant credentials
   */
  async validateMerchant(companyId: number, secretKey: string, apiKey: string): Promise<Merchant> {
    console.log('---MerchantValidationProvider: Validating merchant credentials...');
    console.log('Company ID:', companyId);
    console.log('API Key:', apiKey);

    // Step 1: Check if merchant exists with the given companyId
    const merchant = await this.merchantRepository.findOne({
      where: { merchantId: companyId }
    });

    if (!merchant) {
      console.log('Merchant not found with ID:', companyId);
      throw new UnauthorizedException('Access denied');
    }

    console.log('Merchant found:', merchant.name);

    // Step 2: Validate secret key
    if (merchant.secretKey !== secretKey) {
      console.log('Secret key mismatch');
      throw new UnauthorizedException('Access denied');
    }

    console.log('Secret key validated');

    // Step 3: Validate API key
    if (merchant.apiKey !== apiKey) {
      console.log('API key mismatch');
      throw new UnauthorizedException('Access denied');
    }

    console.log('API key validated');

    // Step 4: Check if merchant is active
    if (merchant.status !== MerchantStatus.ACTIVE) {
      console.log('Merchant is not active. Status:', merchant.status);
      throw new UnauthorizedException('Access denied');
    }

    console.log('=Merchant validation successful');
    return merchant;
  }
}