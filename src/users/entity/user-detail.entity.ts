import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../user.entity';
import { TierType, VerifyStatus } from 'src/common/enums/app.enums';

@Entity('user_detail')
export class UserDetail {
  @PrimaryColumn()
  userId: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'int', default: 0 })
  gatePoint: number;

  @Column({
    type: 'enum',
    enum: VerifyStatus,
    default: VerifyStatus.UNVERIFIED
  })
  verify: VerifyStatus;

  @Column({ nullable: true })
  vaccount: string;

  ////Not yet nanti error
  // @Column({
  //     type: 'enum',
  //     enum: TierType,
  //     enumName: 'tier_type',
  //     default: TierType.BASIC
  //   })
  // tier: TierType;

  @Column({ 
    nullable: true 
  })
  bankName: string;

  @Column({ 
    nullable: true 
  })
  bankNumber: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => User, user => user.userDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}