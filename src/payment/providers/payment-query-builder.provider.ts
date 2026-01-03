import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Brackets } from 'typeorm';
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
   * All comparisons use numbers (sellerId, buyerId, merchantId are all numbers)
   */
  buildUserPaymentsQuery(userId: number): SelectQueryBuilder<Payment> {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.paymentDetails', 'paymentDetails')
      .leftJoinAndSelect('payment.seller', 'seller')
      .leftJoinAndSelect('payment.buyer', 'buyer')
      .leftJoinAndSelect('payment.provider', 'provider')
      // ✅ FIX: Wrap OR conditions in parentheses
      .where(
        new Brackets((qb) => {
          qb.where('payment.buyerId = :userId', { userId })
            .orWhere('payment.sellerId = :userId', { userId })
            .orWhere('payment.merchantId = :userId', { userId });
        })
      );
  }

  /**
   * Apply filters to query
   */
  applyFilters(
    queryBuilder: SelectQueryBuilder<Payment>,
    queryDto: GetUserPaymentsQueryDto,
  ): SelectQueryBuilder<Payment> {

    // Filter by paymentId
    if (queryDto.paymentId) {
      queryBuilder.andWhere('payment.paymentId = :paymentId', { 
        paymentId: queryDto.paymentId 
      });
    }

    // Filter by date range
    if (queryDto.fromDate) {
      queryBuilder.andWhere('payment.createdAt >= :fromDate', {
        fromDate: queryDto.fromDate,
      });
    }

    if (queryDto.toDate) {
      queryBuilder.andWhere('payment.createdAt <= :toDate', {
        toDate: queryDto.toDate,
      });
    }

    // Filter by status
    if (queryDto.status) {
      queryBuilder.andWhere('payment.status = :status', {
        status: queryDto.status,
      });
    }

    // Filter by payment type
    if (queryDto.paymentType) {
      queryBuilder.andWhere('payment.paymentType = :paymentType', {
        paymentType: queryDto.paymentType,
      });
    }

    return queryBuilder;
  }

  /**
   * Apply sorting
   */
  applySorting(
    queryBuilder: SelectQueryBuilder<Payment>,
    sortOrder: 'asc' | 'desc',
  ): SelectQueryBuilder<Payment> {
    return queryBuilder.orderBy('payment.createdAt', sortOrder.toUpperCase() as 'ASC' | 'DESC');
  }

  /**
   * Apply pagination
   */
  applyPagination(
    queryBuilder: SelectQueryBuilder<Payment>,
    page: number,
    limit: number,
  ): SelectQueryBuilder<Payment> {
    // If limit is 0, return all results (no pagination)
    if (limit === 0) {
      return queryBuilder;
    }

    const skip = (page - 1) * limit;
    return queryBuilder.skip(skip).take(limit);
  }

  /**
   * Build complete query with all filters, sorting, and pagination
   */
  buildCompleteQuery(
    userId: number,
    queryDto: GetUserPaymentsQueryDto,
  ): SelectQueryBuilder<Payment> {
    let queryBuilder = this.buildUserPaymentsQuery(userId);
    
    queryBuilder = this.applyFilters(queryBuilder, queryDto);
    queryBuilder = this.applySorting(queryBuilder, queryDto.sortOrder);
    queryBuilder = this.applyPagination(queryBuilder, queryDto.page, queryDto.limit);

    return queryBuilder;
  }
}