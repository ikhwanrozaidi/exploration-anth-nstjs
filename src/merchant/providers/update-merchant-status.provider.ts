import { Injectable, NotFoundException, RequestTimeoutException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateMerchantStatusDto } from '../dtos/update-merchant-status.dto';
import { Merchant } from '../merchant.entity';
import { MerchantStatus } from 'src/common/enums/app.enums';

@Injectable()
export class UpdateMerchantStatusProvider {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  /**
   * Update merchant status
   */
  async updateMerchantStatus(merchantId: number, updateMerchantStatusDto: UpdateMerchantStatusDto): Promise<Merchant> {
    // console.log('UpdateMerchantStatusProvider: Starting merchant status update');
    // console.log('Merchant ID:', merchantId);
    // console.log('New status:', updateMerchantStatusDto.status);

    try {
      // Check if merchant exists
      const existingMerchant = await this.merchantRepository.findOne({
        where: { merchantId }
      });

      if (!existingMerchant) {
        throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
      }

      console.log('Current merchant status:', existingMerchant.status);

      // Check if the status is actually changing
      if (existingMerchant.status === updateMerchantStatusDto.status) {
        throw new BadRequestException(
          `Merchant status is already set to "${updateMerchantStatusDto.status}"`
        );
      }

      // Validate status transition (optional business logic)
      this.validateStatusTransition(existingMerchant.status, updateMerchantStatusDto.status);

      // Update the status
      existingMerchant.status = updateMerchantStatusDto.status;
      
    //   console.log('Updating merchant status in database...');
      const updatedMerchant = await this.merchantRepository.save(existingMerchant);
    //   console.log('Merchant status updated successfully to:', updatedMerchant.status);

      return updatedMerchant;

    } catch (error) {
      console.error('Error updating merchant status:', error);
      
      // If it's a validation error, re-throw it
      if (error.status === 400 || error.status === 404) {
        throw error;
      }

      // For other errors, throw a generic timeout exception
      throw new RequestTimeoutException(
        'Unable to update merchant status at the moment. Please try again later.',
        {
          description: 'Error updating merchant status',
        },
      );
    }
  }

  /**
   * Validate status transitions (business logic)
   * You can customize this based on your business requirements
   */
  private validateStatusTransition(currentStatus: MerchantStatus, newStatus: MerchantStatus): void {
    const invalidTransitions: Record<MerchantStatus, MerchantStatus[]> = {
      [MerchantStatus.PENDING]: [], // Can transition to any status
      [MerchantStatus.ACTIVE]: [], // Can transition to any status
      [MerchantStatus.INACTIVE]: [], // Can transition to any status
      [MerchantStatus.SUSPENDED]: [], // Can transition to any status
    };

    // Example business rule: Suspended merchants cannot be directly activated
    // They must go through pending first
    if (currentStatus === MerchantStatus.SUSPENDED && newStatus === MerchantStatus.ACTIVE) {
      throw new BadRequestException(
        'Suspended merchants cannot be directly activated. Please set status to "pending" first.'
      );
    }

    // You can add more business rules here as needed
    // For example:
    // - Only pending merchants can be activated
    // - Only active merchants can be suspended
    // etc.
  }
}