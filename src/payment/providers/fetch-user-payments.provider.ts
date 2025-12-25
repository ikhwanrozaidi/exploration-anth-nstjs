import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';
import { User } from 'src/users/user.entity';
import { GetUserPaymentsQueryDto } from '../dtos/get-user-payments-query.dto';
import { UserPaymentSummary } from '../interface/payment-user-summary.interface';
import { PaymentQueryBuilderProvider } from './payment-query-builder.provider';
import { PaymentMapperProvider } from './payment-mapper.provider';
import { UserPaymentCounterProvider } from './user-payment-counter.provider';

@Injectable()
export class FetchUserPaymentsProvider {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly queryBuilderProvider: PaymentQueryBuilderProvider,
    private readonly statisticsProvider: UserPaymentCounterProvider,
    private readonly mapperProvider: PaymentMapperProvider,
  ) {}

  /**
   * Fetch user payments with statistics
   */
  async fetchUserPayments(
    userId: number,
    queryDto: GetUserPaymentsQueryDto,
  ): Promise<UserPaymentSummary> {
    console.log('FetchUserPaymentsProvider: Fetching payments for user:', userId);

    try {
      // Build base query
      let query = this.queryBuilderProvider.buildUserPaymentsQuery(userId);

      // Apply filters
      query = this.queryBuilderProvider.applyFilters(query, queryDto);

      // Get all matching payments for statistics calculation
      const allPayments = await query.getMany();
      console.log(`Found ${allPayments.length} total payments for user ${userId}`);

      // Calculate statistics
      const statistics = await this.statisticsProvider.calculateStatistics(
        userId,
        allPayments,
      );

      // Apply sorting
      query = this.queryBuilderProvider.applySorting(query, queryDto.sortOrder);

      // Apply pagination
      const paginatedPayments = await this.queryBuilderProvider.applyPagination(
        query,
        queryDto.page,
        queryDto.limit,
      );

      console.log(`Returning ${paginatedPayments.length} paginated payments`);

      // Map to transactions
      const transactions = this.mapperProvider.mapPaymentsToTransactions(
        paginatedPayments,
        userId,
      );

      return {
        ...statistics,
        transactions,
      };

    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  }
}