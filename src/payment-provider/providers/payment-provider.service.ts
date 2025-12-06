import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentProvider } from '../payment-provider.entity';
import { CreatePaymentProviderDto } from '../dtos/create-paymentprovider.dto';
import { ProviderStatus } from 'src/common/enums/app.enums';
import { UpdatePaymentProviderDto } from '../dtos/update-paymentprovider.dto';

@Injectable()
export class PaymentProviderService {
  constructor(
    @InjectRepository(PaymentProvider)
    private paymentProviderRepository: Repository<PaymentProvider>,
  ) {}

  private generateRandomPublicKey(): number {
    // Generate a random 5-digit number (10000 to 99999)
    return Math.floor(Math.random() * 90000) + 10000;
  }

  async create(createPaymentProviderDto: CreatePaymentProviderDto): Promise<PaymentProvider> {
    const { name, email, status, expiryDate } = createPaymentProviderDto;
    
    let publicKey: number;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate unique public key with retry logic
    do {
      publicKey = this.generateRandomPublicKey();
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new ConflictException('Unable to generate unique public key after multiple attempts');
      }
      
      const existingProvider = await this.paymentProviderRepository.findOne({
        where: { publicKey }
      });
      
      if (!existingProvider) {
        break;
      }
    } while (attempts <= maxAttempts);

    const paymentProvider = this.paymentProviderRepository.create({
      publicKey,
      name,
      email,
      status: status || ProviderStatus.ACTIVE,
      expiryDate: new Date(expiryDate),
    });

    try {
      return await this.paymentProviderRepository.save(paymentProvider);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException('A provider with this email or public key already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<PaymentProvider[]> {
    return this.paymentProviderRepository.find();
  }

  async findOne(id: string): Promise<PaymentProvider> {
    const paymentProvider = await this.paymentProviderRepository.findOne({
      where: { providerId: id }
    });

    if (!paymentProvider) {
      throw new NotFoundException(`Payment provider with ID ${id} not found`);
    }

    return paymentProvider;
  }

  async update(id: string, updatePaymentProviderDto: UpdatePaymentProviderDto): Promise<PaymentProvider> {
    const paymentProvider = await this.findOne(id);

    const { name, email, status, expiryDate } = updatePaymentProviderDto;

    // Update only provided fields
    if (name !== undefined) paymentProvider.name = name;
    if (email !== undefined) paymentProvider.email = email;
    if (status !== undefined) paymentProvider.status = status;
    if (expiryDate !== undefined) paymentProvider.expiryDate = new Date(expiryDate);

    try {
      return await this.paymentProviderRepository.save(paymentProvider);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException('A provider with this email already exists');
      }
      throw error;
    }
  }
}