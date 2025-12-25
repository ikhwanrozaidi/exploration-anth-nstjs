import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Payment } from '../payment.entity';
import { GetUserPaymentsQueryDto } from '../dtos/get-user-payments-query.dto';

@Injectable()
export class PaymentQueryBuilderProvider {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Build base query for user payments
   */
  buildUserPaymentsQuery(userId: number): SelectQueryBuilder<Payment> {
    const userIdString = userId.toString();

    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.paymentDetails', 'paymentDetails')
      .leftJoinAndSelect('payment.seller', 'seller') // ✅ Changed from receiver
      .leftJoinAndSelect('payment.buyer', 'buyer')   // ✅ Changed from sender
      .leftJoinAndSelect('payment.provider', 'provider')
      .where('payment.buyerId = :userId OR payment.sellerId = :userId', {  // ✅ Changed field names
        userId: userIdString 
      });
  }

  /**
   * Apply filters to query
   */
  applyFilters(
    query: SelectQueryBuilder<Payment>,
    queryDto: GetUserPaymentsQueryDto,
  ): SelectQueryBuilder<Payment> {
    // Date range filter
    if (queryDto.fromDate) {
      query = query.andWhere('payment.createdAt >= :fromDate', { 
        fromDate: new Date(queryDto.fromDate) 
      });
    }

    if (queryDto.toDate) {
      const toDate = new Date(queryDto.toDate);
      toDate.setHours(23, 59, 59, 999); // End of day
      query = query.andWhere('payment.createdAt <= :toDate', { toDate });
    }

    // Status filter
    if (queryDto.status) {
      query = query.andWhere('payment.status = :status', { 
        status: queryDto.status 
      });
    }

    // Payment type filter
    if (queryDto.paymentType) {
      query = query.andWhere('payment.paymentType = :paymentType', { 
        paymentType: queryDto.paymentType 
      });
    }

    return query;
  }

  /**
   * Apply sorting
   */
  applySorting(
    query: SelectQueryBuilder<Payment>,
    sortOrder: 'asc' | 'desc',
  ): SelectQueryBuilder<Payment> {
    return query.orderBy(
      'payment.createdAt', 
      sortOrder.toUpperCase() as 'ASC' | 'DESC'
    );
  }

  /**
   * Apply pagination
   */
  async applyPagination(
    query: SelectQueryBuilder<Payment>,
    page: number,
    limit: number,
  ): Promise<Payment[]> {
    if (limit === 0) {
      // Return all
      return await query.getMany();
    }

    const skip = (page - 1) * limit;
    return await query
      .skip(skip)
      .take(limit)
      .getMany();
  }
}