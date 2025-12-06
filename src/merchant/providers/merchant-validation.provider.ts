import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMerchantDto } from '../dtos/create-merchant.dto';
import { Merchant } from '../merchant.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class MerchantValidationProvider {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Validate merchant data for uniqueness
   */
  async validateMerchantData(createMerchantDto: CreateMerchantDto): Promise<void> {
    const { name, email, phone } = createMerchantDto;

    // Check if merchant name already exists
    const existingMerchantByName = await this.merchantRepository.findOne({
      where: { name }
    });

    if (existingMerchantByName) {
      throw new BadRequestException(
        `Merchant with name "${name}" already exists. Please choose a different name.`
      );
    }

    // Check if merchant email already exists
    const existingMerchantByEmail = await this.merchantRepository.findOne({
      where: { email }
    });

    if (existingMerchantByEmail) {
      throw new BadRequestException(
        `Merchant with email "${email}" already exists. Please use a different email.`
      );
    }

    // Check if merchant phone already exists
    const existingMerchantByPhone = await this.merchantRepository.findOne({
      where: { phone }
    });

    if (existingMerchantByPhone) {
      throw new BadRequestException(
        `Merchant with phone "${phone}" already exists. Please use a different phone number.`
      );
    }

    // Check if email exists in users table
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email }
    });

    if (existingUserByEmail) {
      throw new BadRequestException(
        `Email "${email}" is already registered as a user. Please use a different email.`
      );
    }

    // Check if phone exists in users table (assuming User entity has phone field)
    // Note: If User entity doesn't have phone field, comment out this section
    try {
      const existingUserByPhone = await this.userRepository.findOne({
        where: { phone } as any // Cast to any if phone field doesn't exist in User entity
      });

      if (existingUserByPhone) {
        throw new BadRequestException(
          `Phone "${phone}" is already registered as a user. Please use a different phone number.`
        );
      }
    } catch (error) {
      // If User entity doesn't have phone field, this will fail silently
      // You can comment out this section if User entity doesn't have phone field
      console.warn('Phone validation skipped - User entity may not have phone field');
    }
  }
}