import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryColumn()
  userId: number;

  @Column({ default: true })
  marketing: boolean;

  @Column({ default: true })
  notifications: boolean;

  @Column({ default: false })
  twoFA: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => User, user => user.userSettings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;
}