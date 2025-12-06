import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Merchant } from '../merchant.entity';
import { MerchantAuditStatus } from 'src/common/enums/app.enums';

@Entity('merchant_audit_log')
export class MerchantAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  merchantId: number;

  @Column()
  paymentId: string;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @Column({
    type: 'enum',
    enum: MerchantAuditStatus,
    enumName: 'merchant_audit_status_enum',
    default: MerchantAuditStatus.PENDING
  })
  status: MerchantAuditStatus;
}