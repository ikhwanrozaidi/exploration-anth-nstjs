import { Injectable } from '@nestjs/common';
import { CreateOrderProvider } from './providers/create-order.provider';
import { Payment } from 'src/payment/payment.entity';
import { BuyerCreateOrderDto } from './dtos/create-order.dto';

@Injectable()
export class BuyerService {
  constructor(private readonly createOrderProvider: CreateOrderProvider) {}

  /**
   * Create P2P order
   */
  async createOrder(
    buyerId: number,
    buyerCreateOrderDto: BuyerCreateOrderDto,
    ipAddress?: string,
  ): Promise<Payment> {
    return await this.createOrderProvider.createOrder(
      buyerId,
      buyerCreateOrderDto,
      ipAddress,
    );
  }
}
