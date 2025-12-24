import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, DeleteDateColumn, PrimaryColumn } from 'typeorm';
import { Merchant } from '../merchant/merchant.entity';
import { Payment } from '../payment/payment.entity';
import { UserRole, UserStatus } from 'src/common/enums/app.enums';
import { UserDetail } from './entity/user-detail.entity';
import { UserSettings } from './entity/user-settings.entity';

@Entity('user')
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ nullable: true, unique: true })
  username: string;

  @Column({ nullable: true })
  usernameChangedAt: Date;

  @Column({ nullable: true, type: 'int' })
  merchantId?: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    enumName: 'user_status_enum',
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  registeredAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  referralCode: string;

  @OneToOne(() => UserDetail, userDetail => userDetail.user, { cascade: true })
  userDetail: UserDetail;

  @OneToOne(() => UserSettings, userSettings => userSettings.user, { cascade: true })
  userSettings: UserSettings;
}