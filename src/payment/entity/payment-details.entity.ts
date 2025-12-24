import { Payment } from '../payment.entity';
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('payment_details')
export class PaymentDetails {
  @PrimaryColumn()
  paymentId: string;

  @Column({ 
    nullable: true // just change to true
  })
  signature: string;

  @Column({ 
    nullable: false 
  })
  productName: string;

  @Column({ 
    type: 'json',
    nullable: false // just change to false 
  })
  productDesc: string[];

  @Column({ 
    nullable: true 
  })
  productCat: string;

  @Column({ 
    nullable: false,
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  amount: number;

  @Column({ 
    nullable: true // just change to true
  })
  buyerName: string;

  @Column({ 
    nullable: true // just change to true 
  })
  buyerEmail: string;

  @Column({ 
    nullable: true 
  })
  buyerPhone: string;

  @Column({ 
    nullable: true 
  })
  refundable: boolean;

  @OneToOne(() => Payment, payment => payment.paymentDetails)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;
}