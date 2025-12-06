import { Injectable } from '@nestjs/common';
import { CreateMerchantProvider } from './create-merchant.provider';
import { CreateMerchantDto } from '../dtos/create-merchant.dto';
import { Merchant } from '../merchant.entity';
import { CreateMerchantDetailProvider } from './create-merchantdetail.provider';
import { FetchAllMerchantsProvider } from './fetch-all-merchant.provider';
import { CreateMerchantDetailDto } from '../dtos/create-merchant-detail.dto';
import { MerchantDetail } from '../entity/merchant-details.entity';
import { UpdateMerchantStatusProvider } from './update-merchant-status.provider';
import { UpdateMerchantStatusDto } from '../dtos/update-merchant-status.dto';

@Injectable()
export class MerchantService {
  constructor(

    private readonly createMerchantProvider: CreateMerchantProvider,

    private readonly createMerchantDetailProvider: CreateMerchantDetailProvider,

    private readonly fetchAllMerchantsProvider: FetchAllMerchantsProvider,

    private readonly updateMerchantStatusProvider: UpdateMerchantStatusProvider,

  ) {}

  /**
   * Create a new merchant
   */
  async createMerchant(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    return await this.createMerchantProvider.createMerchant(createMerchantDto);
  }

  /**
   * Create merchant detail
   */
  async createMerchantDetail(merchantId: number, createMerchantDetailDto: CreateMerchantDetailDto): Promise<MerchantDetail> {
    return await this.createMerchantDetailProvider.createMerchantDetail(merchantId, createMerchantDetailDto);
  }

  /**
   * Fetch all merchants with details
   */
  async fetchAllMerchants(): Promise<Merchant[]> {
    return await this.fetchAllMerchantsProvider.fetchAllMerchants();
  }

  /**
   * Update merchant status
   */
  async updateMerchantStatus(merchantId: number, updateMerchantStatusDto: UpdateMerchantStatusDto): Promise<Merchant> {
    return await this.updateMerchantStatusProvider.updateMerchantStatus(merchantId, updateMerchantStatusDto);
  }
}