import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMerchantDetailDto } from '../dtos/create-merchant-detail.dto';
import { MerchantDetailValidationProvider } from './merchantdetail-validation.provider';
import { MerchantDetail } from '../entity/merchant-details.entity';

@Injectable()
export class CreateMerchantDetailProvider {
  constructor(

    @InjectRepository(MerchantDetail)
    private readonly merchantDetailRepository: Repository<MerchantDetail>,

    private readonly merchantDetailValidationProvider: MerchantDetailValidationProvider,
    
  ) {}

  /**
   * Create merchant detail
   */
  async createMerchantDetail(merchantId: number, createMerchantDetailDto: CreateMerchantDetailDto): Promise<MerchantDetail> {
    // console.log('CreateMerchantDetailProvider: Starting merchant detail creation process');
    // console.log('Merchant ID:', merchantId);
    // console.log('CreateMerchantDetailDto:', createMerchantDetailDto);

    try {
      // Validate merchant detail data
      // console.log('Validating merchant detail data...');
      await this.merchantDetailValidationProvider.validateMerchantDetailData(merchantId, createMerchantDetailDto);
      // console.log('Merchant detail validation passed');

      // Create merchant detail entity
      // console.log('Creating merchant detail entity...');
      const newMerchantDetail = this.merchantDetailRepository.create({
        ...createMerchantDetailDto,
        merchantId,
      });

      // console.log('Merchant detail entity created, saving to database...');
      const savedMerchantDetail = await this.merchantDetailRepository.save(newMerchantDetail);
      // console.log('Merchant detail saved successfully for merchant ID:', savedMerchantDetail.merchantId);

      return savedMerchantDetail;

    } catch (error) {
      console.error('Error creating merchant detail:', error);
      
      // If it's a validation error, re-throw it
      if (error.status === 400 || error.status === 404) {
        throw error;
      }

      // For other errors, throw a generic timeout exception
      throw new RequestTimeoutException(
        'Unable to create merchant detail at the moment. Please try again later.',
        {
          description: 'Error creating merchant detail',
        },
      );
    }
  }
}