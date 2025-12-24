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
  sellerId: string;

  @Column({
    nullable: false,
  })
  buyerId: string;

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

  @Column({ nullable: true })
  merchantOrderId: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column()
  providerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

 @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sellerId', referencedColumnName: 'id' })
  seller: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'buyerId', referencedColumnName: 'id' })
  buyer: User;

  @ManyToOne(() => PaymentProvider)
  @JoinColumn({ name: 'providerId' })
  provider: PaymentProvider;

  @OneToOne(() => PaymentDetails, paymentDetails => paymentDetails.payment, { cascade: true })
  paymentDetails: PaymentDetails;
}