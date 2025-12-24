import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { MerchantStatus } from 'src/common/enums/app.enums';
import { MerchantDetail } from './entity/merchant-details.entity';

@Entity('merchant')
export class Merchant {
  @PrimaryGeneratedColumn()
  merchantId: number;

  @Column({ unique: true })
  publicKey: number;

  @Column()
  apiKey: string;

  @Column()
  secretKey: string;

  @Column({ nullable: true })
  callbackUrl: string;

  @Column({ nullable: true })
  directCallbackUrl: string;

  @Column({ nullable: true })
  withdrawalCallbackUrl: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  // Category need to be enum later
  @Column()
  category: number;

  @Column({
    type: 'enum',
    enum: MerchantStatus,
    enumName: 'merchant_status_enum',
    default: MerchantStatus.PENDING
  })
  status: MerchantStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => MerchantDetail, merchantDetail => merchantDetail.merchant, { cascade: true })
  merchantDetail: MerchantDetail;
}