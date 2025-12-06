import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { Merchant } from '../merchant.entity';

@Entity('merchant_category')
export class MerchantCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  merchantId: number;

  @Column()
  categoryName: string;

  @Column({ nullable: true })
  categoryDescription: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}