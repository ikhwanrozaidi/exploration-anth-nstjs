import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../merchant.entity';

@Injectable()
export class FetchAllMerchantsProvider {
  constructor(

    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    
  ) {}

  /**
   * Fetch all merchants with their details
   */
  async fetchAllMerchants(): Promise<Merchant[]> {
    // console.log('FetchAllMerchantsProvider: Fetching all merchants with details');

    try {
      const merchants = await this.merchantRepository.find({
        relations: ['merchantDetail'],
        order: {
          createdAt: 'DESC'
        }
      });

      // console.log(`Found ${merchants.length} merchants`);
      return merchants;

    } catch (error) {
      console.error('Error fetching merchants:', error);
      
      throw new RequestTimeoutException(
        'Unable to fetch merchants at the moment. Please try again later.',
        {
          description: 'Error fetching merchants',
        },
      );
    }
  }
}