import { Injectable } from '@nestjs/common';
import { RequestWithdrawalProvider } from './providers/request-withdrawal.provider';
import { RequestWithdrawalDto } from './dtos/request-withdrawal.dto';
import { Withdrawal } from './entity/withdrawal.entity';
import { Wallet } from './entity/wallet.entity';
import { TransferWalletDto } from './dtos/transfer-wallet.dto';
import { TransferResult, TransferWalletProvider } from './providers/transfer-wallet.provider';

@Injectable()
export class WalletService {
  constructor(

    private readonly requestWithdrawalProvider: RequestWithdrawalProvider,

    private readonly transferWalletProvider: TransferWalletProvider,
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

  /**
   * Transfer funds to another user
   */
  async transfer(
    userId: number,
    transferDto: TransferWalletDto,
  ): Promise<TransferResult> {
    return await this.transferWalletProvider.transfer(userId, transferDto);
  }
}