import { PaymentDetails } from './entity/payment-details.entity';
import { PaymentProvider } from '../payment-provider/payment-provider.entity';
import { User } from '../users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PaymentType, PaymentStatus } from 'src/common/enums/app.enums';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  paymentId: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
    enumName: 'payment_type_enum'
  })
  paymentType: PaymentType;

  @Column({
    nullable: true,
  })
  receiverId: string;

  @Column({
    nullable: false,
  })
  senderId: string;

  @Column({ nullable: true })
  merchantId: number;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  amount: number;

  @Column({
    default: false
  })
  isRequest: boolean;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payment_status',
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column()
  providerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'receiverId', referencedColumnName: 'id' })
  receiver: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
  sender: User;

  @ManyToOne(() => PaymentProvider)
  @JoinColumn({ name: 'providerId' })
  provider: PaymentProvider;

  @OneToOne(() => PaymentDetails, paymentDetails => paymentDetails.payment, { cascade: true })
  paymentDetails: PaymentDetails;
}