import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMerchantDto } from '../dtos/create-merchant.dto';
import { KeyGenerationProvider } from './key-generation.provider';
import { MerchantValidationProvider } from './merchant-validation.provider';
import { Merchant } from '../merchant.entity';
import { MerchantStatus } from 'src/common/enums/app.enums';

@Injectable()
export class CreateMerchantProvider {
  constructor(

    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    private readonly keyGenerationProvider: KeyGenerationProvider,

    private readonly merchantValidationProvider: MerchantValidationProvider,
  ) {}

  /**
   * Create a new merchant
   */
  async createMerchant(createMerchantDto: CreateMerchantDto): Promise<Merchant> {

    try {
      // Validate merchant data for uniqueness
      await this.merchantValidationProvider.validateMerchantData(createMerchantDto);

      // Generate unique API key
      const apiKey = await this.keyGenerationProvider.generateApiKey();

      // Generate unique secret key
      const secretKey = await this.keyGenerationProvider.generateSecretKey();

      // Create merchant entity
      const newMerchant = this.merchantRepository.create({
        ...createMerchantDto,
        apiKey,
        secretKey,
        status: MerchantStatus.PENDING,
      });

      const savedMerchant = await this.merchantRepository.save(newMerchant);

      return savedMerchant;

    } catch (error) {
      console.error('Error creating merchant:', error);
      
      // If it's a validation error, re-throw it
      if (error.status === 400) {
        throw error;
      }

      // For other errors, throw a generic timeout exception
      throw new RequestTimeoutException(
        'Unable to create merchant at the moment. Please try again later.',
        {
          description: 'Error creating merchant',
        },
      );
    }
  }
}