import { Merchant } from '../merchant.entity';
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('merchant_detail')
export class MerchantDetail {
  @PrimaryColumn()
  merchantId: number;

  @Column()
  founderName: string;

  @Column()
  founderPhone: string;

  @Column()
  businessAddress: string;

  @Column()
  ssmNumber: string;

  @Column()
  picName: string;

  @Column()
  picNumber: string;

  @Column({ 
    nullable: false 
  })
  bankName: string;

  @Column({ 
    nullable: false 
  })
  bankNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => Merchant, merchant => merchant.merchantDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;
}