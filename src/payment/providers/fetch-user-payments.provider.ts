import { Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { UserPaymentSummary } from '../interface/payment-user-summary.interface';
import { GetUserPaymentsQueryDto } from '../dtos/get-user-payments-query.dto';
import { PaymentQueryBuilderProvider } from './payment-query-builder.provider';
import { PaymentMapperProvider } from './payment-mapper.provider';
import { UserPaymentCounterProvider } from './user-payment-counter.provider';

@Injectable()
export class FetchUserPaymentsProvider {
  constructor(
    private readonly queryBuilderProvider: PaymentQueryBuilderProvider,
    private readonly mapperProvider: PaymentMapperProvider,
    private readonly statisticsProvider: UserPaymentCounterProvider,
  ) {}

  /**
   * Fetch user payments with statistics
   * All comparisons use numbers (sellerId, buyerId, merchantId are all numbers)
   */
  async fetchUserPayments(
    userId: number,
    queryDto: GetUserPaymentsQueryDto,
  ): Promise<UserPaymentSummary> {
    console.log('FetchUserPaymentsProvider: Getting payments for user ID:', userId);
    console.log('Query params:', queryDto);

    try {
      // Step 1: Build query with filters, sorting, and pagination
      const queryBuilder = this.queryBuilderProvider.buildCompleteQuery(userId, queryDto);

      // Step 2: Execute query to get filtered payments
      const payments = await queryBuilder.getMany();
      console.log(`Found ${payments.length} payments for user ${userId}`);

      if (queryDto.paymentId && payments.length === 0) {
        throw new NotFoundException(
          `Payment with ID ${queryDto.paymentId} not found or you don't have access to it`
        );
      }

      // Step 3: Calculate statistics using ALL user payments (not just filtered ones)
      // We need all payments to calculate correct statistics
      const allPaymentsQuery = this.queryBuilderProvider.buildUserPaymentsQuery(userId);
      const allPayments = await allPaymentsQuery.getMany();
      console.log(`Found ${allPayments.length} total payments for statistics`);

      const statistics = await this.statisticsProvider.calculateStatistics(userId, allPayments);

      // Step 4: Map filtered payments to transaction format
      const transactions = this.mapperProvider.mapPaymentsToTransactions(payments, userId);

      // Step 5: Return combined summary
      const summary: UserPaymentSummary = {
        ...statistics,
        transactions,
      };

      console.log('Returning payment summary with', transactions.length, 'transactions');
      return summary;

    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw new RequestTimeoutException(
        'Unable to fetch payments at the moment. Please try again later.'
      );
    }
  }
}