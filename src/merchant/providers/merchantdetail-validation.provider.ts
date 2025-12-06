import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMerchantDetailDto } from '../dtos/create-merchant-detail.dto';
import { Merchant } from '../merchant.entity';
import { MerchantDetail } from '../entity/merchant-details.entity';

@Injectable()
export class MerchantDetailValidationProvider {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    @InjectRepository(MerchantDetail)
    private readonly merchantDetailRepository: Repository<MerchantDetail>,
  ) {}

  /**
   * Validate merchant exists and detail data for uniqueness
   */
  async validateMerchantDetailData(merchantId: number, createMerchantDetailDto: CreateMerchantDetailDto): Promise<void> {
    // Check if merchant exists
    const existingMerchant = await this.merchantRepository.findOne({
      where: { merchantId }
    });

    if (!existingMerchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
    }

    // Check if merchant detail already exists
    const existingMerchantDetail = await this.merchantDetailRepository.findOne({
      where: { merchantId }
    });

    if (existingMerchantDetail) {
      throw new BadRequestException(
        `Merchant detail for merchant ID ${merchantId} already exists. Use PUT method to update.`
      );
    }

    // Check if SSM number already exists
    const existingMerchantDetailBySSM = await this.merchantDetailRepository.findOne({
      where: { ssmNumber: createMerchantDetailDto.ssmNumber }
    });

    if (existingMerchantDetailBySSM) {
      throw new BadRequestException(
        `SSM number "${createMerchantDetailDto.ssmNumber}" already exists. Please use a different SSM number.`
      );
    }

    // Check if bank number already exists
    const existingMerchantDetailByBankNumber = await this.merchantDetailRepository.findOne({
      where: { bankNumber: createMerchantDetailDto.bankNumber }
    });

    if (existingMerchantDetailByBankNumber) {
      throw new BadRequestException(
        `Bank number "${createMerchantDetailDto.bankNumber}" already exists. Please use a different bank number.`
      );
    }

    // Check if founder phone already exists
    const existingMerchantDetailByFounderPhone = await this.merchantDetailRepository.findOne({
      where: { founderPhone: createMerchantDetailDto.founderPhone }
    });

    if (existingMerchantDetailByFounderPhone) {
      throw new BadRequestException(
        `Founder phone "${createMerchantDetailDto.founderPhone}" already exists. Please use a different phone number.`
      );
    }

    // Check if PIC phone already exists
    const existingMerchantDetailByPicPhone = await this.merchantDetailRepository.findOne({
      where: { picNumber: createMerchantDetailDto.picNumber }
    });

    if (existingMerchantDetailByPicPhone) {
      throw new BadRequestException(
        `PIC phone "${createMerchantDetailDto.picNumber}" already exists. Please use a different phone number.`
      );
    }
  }
}