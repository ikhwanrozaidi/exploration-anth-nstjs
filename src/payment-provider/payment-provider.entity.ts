import { Payment } from '../payment/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn, PrimaryColumn } from 'typeorm';
import { ProviderStatus } from 'src/common/enums/app.enums';

@Entity('payment_provider')
export class PaymentProvider {
  @PrimaryGeneratedColumn('uuid')
  providerId: string;

  @Column({ unique: true })
  publicKey: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: ProviderStatus,
    enumName: 'provider_status_enum',
    default: ProviderStatus.ACTIVE
  })
  status: ProviderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}