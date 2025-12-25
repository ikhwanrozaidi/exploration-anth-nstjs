import { 
  Injectable, 
  BadRequestException, 
  NotFoundException,
  RequestTimeoutException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from '../entity/wallet.entity';
import { Withdrawal } from '../entity/withdrawal.entity';
import { User } from 'src/users/user.entity';
import { RequestWithdrawalDto } from '../dtos/request-withdrawal.dto';
import { WalletDirection, WalletStatus, WithdrawalStatus } from 'src/common/enums/app.enums';

@Injectable()
export class RequestWithdrawalProvider {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async requestWithdrawal(
    userId: number,
    requestWithdrawalDto: RequestWithdrawalDto,
  ): Promise<{ withdrawal: Withdrawal; wallet: Wallet }> {
    console.log('RequestWithdrawalProvider: Starting withdrawal request');
    console.log('User ID:', userId);
    console.log('Amount:', requestWithdrawalDto.amount);

    // Convert amount to number
    const amount = parseFloat(requestWithdrawalDto.amount);

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than 0');
    }

    // Step 1: Find user
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Step 2: Check if user has sufficient balance
    const userBalance = parseFloat(user.balance.toString());
    
    if (userBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: RM ${userBalance.toFixed(2)}, Requested: RM ${amount.toFixed(2)}`
      );
    }

    console.log('Balance check passed');
    console.log('User balance before:', userBalance);

    // Step 3: Get latest wallet balance (cumulative)
    const latestWallet = await this.walletRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    const currentWalletBalance = latestWallet 
      ? parseFloat(latestWallet.balance.toString()) 
      : userBalance;

    const newWalletBalance = currentWalletBalance - amount;

    console.log('Wallet balance before:', currentWalletBalance);
    console.log('Wallet balance after:', newWalletBalance);

    // Step 4: Create transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 4a. Deduct amount from user's balance
      user.balance = userBalance - amount;
      await queryRunner.manager.save(user);

      console.log('User balance after deduction:', user.balance);

      // 4b. Create Withdrawal record
      const withdrawal = queryRunner.manager.create(Withdrawal, {
        userId: userId,
        amount: amount,
        bankName: requestWithdrawalDto.bankName,
        bankNumber: requestWithdrawalDto.bankAccount,
        status: WithdrawalStatus.REQUESTED,
      });

      const savedWithdrawal = await queryRunner.manager.save(withdrawal);
      console.log('Withdrawal record created with ID:', savedWithdrawal.id);

      // 4c. Create Wallet record (transaction log)
      const wallet = queryRunner.manager.create(Wallet, {
        userId: userId,
        amount: amount,
        direction: WalletDirection.OUT,
        source: null, // ✅ NULL as requested
        status: WalletStatus.PENDING,
        oppositeId: null, // ✅ NULL as requested
        reference: `WITHDRAWAL-${savedWithdrawal.id}`,
        balance: newWalletBalance,
      });

      const savedWallet = await queryRunner.manager.save(wallet);
      console.log('Wallet transaction logged with ID:', savedWallet.id);

      // Commit transaction
      await queryRunner.commitTransaction();
      console.log('Transaction committed successfully');

      return {
        withdrawal: savedWithdrawal,
        wallet: savedWallet,
      };

    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Transaction failed, rolling back:', error);
      
      throw new RequestTimeoutException(
        'Unable to process withdrawal request at the moment. Please try again later.',
        {
          description: 'Withdrawal request failed',
        },
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}