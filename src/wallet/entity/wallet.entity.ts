import { WalletDirection, WalletSource } from 'src/common/enums/app.enums';
import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';


@Entity('wallet')
export class Wallet {
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

  @Column({
    type: 'enum',
    enum: WalletDirection,
    enumName: 'wallet_direction_enum'
  })
  direction: WalletDirection;

  @Column({
    type: 'enum',
    enum: WalletSource,
    enumName: 'wallet_source_enum'
  })
  source: WalletSource;

  @Column({ nullable: true })
  receiverId: number;

  @Column({ nullable: true })
  reference: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}