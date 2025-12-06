import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Payment } from '../payment/payment.entity';
import { PaymentProvider } from '../payment-provider/payment-provider.entity';
import { RedirectStatus, ProviderStatus, PaymentOrderStatus } from 'src/common/enums/app.enums';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  paymentId: string;

  @Column()
  initiatorId: string;

  @Column({
    type: 'enum',
    enum: RedirectStatus,
    enumName: 'redirect_status_enum'
  })
  redirectStatus: RedirectStatus;

  @Column({
    type: 'enum',
    enum: PaymentOrderStatus,
    enumName: 'payment_audit_status_enum',
    default: PaymentOrderStatus.PENDING
  })
  status: PaymentOrderStatus;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @Column()
  providerId: string;

  @Column({
    type: 'enum',
    enum: ProviderStatus,
    enumName: 'provider_status_audit'
  })
  providerStatus: ProviderStatus;

  @Column({ nullable: true })
  providerCallback: string;

  @Column({ nullable: true })
  providerPaymentId: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  deviceInfo: string;
}