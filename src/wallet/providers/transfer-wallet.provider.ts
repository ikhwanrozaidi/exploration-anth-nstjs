import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Wallet } from '../entity/wallet.entity';
import { WalletDirection, WalletSource, WalletStatus } from 'src/common/enums/app.enums';
import { TransferWalletDto } from '../dtos/transfer-wallet.dto';

export interface TransferResult {
  transactionId: number;
  amount: number;
  from: string;
  to: string;
  newBalance: number;
  reference: string;
}

@Injectable()
export class TransferWalletProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Transfer funds from one user to another
   */
  async transfer(
    senderId: number,
    transferDto: TransferWalletDto,
  ): Promise<TransferResult> {
    console.log('TransferWalletProvider: Processing transfer');
    console.log('Sender ID:', senderId);
    console.log('Transfer details:', transferDto);

    const amount = parseFloat(transferDto.amount);

    // Step 1: Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be greater than zero');
    }

    if (amount < 1) {
      throw new BadRequestException('Minimum transfer amount is RM 1.00');
    }

    if (amount > 10000) {
      throw new BadRequestException('Maximum transfer amount is RM 10,000.00');
    }

    // Step 2: Get sender user
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException('Sender account not found');
    }

    // Step 3: Get receiver user by username
    const receiver = await this.userRepository.findOne({
      where: { username: transferDto.username },
    });

    if (!receiver) {
      throw new NotFoundException(`User with username '${transferDto.username}' not found`);
    }

    // Step 4: Validate sender and receiver are different
    if (sender.id === receiver.id) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Step 5: Check sender balance
    const senderBalance = parseFloat(sender.balance.toString());
    if (senderBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: RM ${senderBalance.toFixed(2)}, Required: RM ${amount.toFixed(2)}`
      );
    }

    // Step 6: Check receiver account status (optional - add if needed)
    // if (receiver.status !== UserStatus.ACTIVE) {
    //   throw new BadRequestException('Receiver account is not active');
    // }

    console.log('Validation passed. Executing transfer...');
    console.log(`From: ${sender.username} (ID: ${sender.id}) - Balance: RM ${senderBalance}`);
    console.log(`To: ${receiver.username} (ID: ${receiver.id}) - Balance: RM ${receiver.balance}`);
    console.log(`Amount: RM ${amount}`);

    // Step 7: Execute transfer in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate new balances
      const senderNewBalance = senderBalance - amount;
      const receiverCurrentBalance = parseFloat(receiver.balance.toString());
      const receiverNewBalance = receiverCurrentBalance + amount;

      // 7a. Deduct from sender balance
      sender.balance = senderNewBalance;
      await queryRunner.manager.save(sender);

      console.log(`Sender new balance: RM ${senderNewBalance.toFixed(2)}`);

      // 7b. Add to receiver balance
      receiver.balance = receiverNewBalance;
      await queryRunner.manager.save(receiver);

      console.log(`Receiver new balance: RM ${receiverNewBalance.toFixed(2)}`);

      // 7c. Create sender wallet record (OUT)
      const senderWalletRecord = queryRunner.manager.create(Wallet, {
        userId: sender.id,
        amount: amount,
        direction: WalletDirection.OUT,
        balance: senderNewBalance,
        source: WalletSource.SEND,
        status: WalletStatus.SUCCESS,
        oppositeId: receiver.id,
        reference: transferDto.reference,
      });

      const savedSenderRecord = await queryRunner.manager.save(senderWalletRecord);
      console.log('Sender wallet record created:', savedSenderRecord.id);

      // 7d. Create receiver wallet record (IN)
      const receiverWalletRecord = queryRunner.manager.create(Wallet, {
        userId: receiver.id,
        amount: amount,
        direction: WalletDirection.IN,
        balance: receiverNewBalance,
        source: WalletSource.RECEIVE,
        status: WalletStatus.SUCCESS,
        oppositeId: sender.id,
        reference: transferDto.reference,
      });

      const savedReceiverRecord = await queryRunner.manager.save(receiverWalletRecord);
      console.log('Receiver wallet record created:', savedReceiverRecord.id);

      // Commit transaction
      await queryRunner.commitTransaction();

      console.log('Transfer completed successfully');

      return {
        transactionId: savedSenderRecord.id,
        amount: amount,
        from: sender.username,
        to: receiver.username,
        newBalance: senderNewBalance,
        reference: transferDto.reference,
      };

    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Error executing transfer:', error);
      throw new BadRequestException('Failed to process transfer. Please try again.');
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}