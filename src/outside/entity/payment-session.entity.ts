import { Merchant } from 'src/merchant/merchant.entity';
import { PaymentStatus, PaymentSessionStatus } from 'src/common/enums/app.enums';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('payment_session')
export class PaymentSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @Column()
  merchantId: number;

  @Column({ type: 'text' })
  paymentPayload: string;

  @Column({
    type: 'enum',
    enum: PaymentSessionStatus,
    default: PaymentSessionStatus.PENDING
  })
  status: PaymentSessionStatus;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Optional: Link to original session for retry scenarios
  @Column({ nullable: true })
  originalSessionId?: number;

  @ManyToOne(() => Merchant, { eager: false })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;
}