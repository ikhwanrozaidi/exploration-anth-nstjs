import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { WalletDirection } from '../../common/enums/app.enums';

@Entity('account_audit')
export class AccountAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentId: string;

  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2 
  })
  percentage: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  amount: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  balance: number;

  @Column({
    type: 'enum',
    enum: WalletDirection,
    enumName: 'wallet_direction_enum'
  })
  direction: WalletDirection;

  @CreateDateColumn()
  createdAt: Date;
}