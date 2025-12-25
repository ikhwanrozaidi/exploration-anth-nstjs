import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entity/wallet.entity';
import { Withdrawal } from './entity/withdrawal.entity';
import { RequestWithdrawalProvider } from './providers/request-withdrawal.provider';
import { User } from 'src/users/user.entity';

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    RequestWithdrawalProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      Withdrawal,
      User,
    ])],
  exports: [WalletService],
})
export class WalletModule {}
