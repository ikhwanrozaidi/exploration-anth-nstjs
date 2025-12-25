import { Injectable } from '@nestjs/common';
import { RequestWithdrawalProvider } from './providers/request-withdrawal.provider';
import { RequestWithdrawalDto } from './dtos/request-withdrawal.dto';
import { Withdrawal } from './entity/withdrawal.entity';
import { Wallet } from './entity/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    private readonly requestWithdrawalProvider: RequestWithdrawalProvider,
  ) {}

  /**
   * Request withdrawal
   */
  async requestWithdrawal(
    userId: number,
    requestWithdrawalDto: RequestWithdrawalDto,
  ): Promise<{ withdrawal: Withdrawal; wallet: Wallet }> {
    return await this.requestWithdrawalProvider.requestWithdrawal(
      userId,
      requestWithdrawalDto,
    );
  }
}