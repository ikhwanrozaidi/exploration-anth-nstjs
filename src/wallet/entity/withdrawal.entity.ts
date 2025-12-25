import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { WithdrawalStatus } from 'src/common/enums/app.enums';

@Entity('withdrawal')
export class Withdrawal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  amount: number;

  @Column()
  bankName: string;

  @Column()
  bankNumber: string;

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    enumName: 'withdrawal_status_enum',
    default: WithdrawalStatus.REQUESTED
  })
  status: WithdrawalStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}