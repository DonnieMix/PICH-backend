import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Card } from '../../cards/entities/card.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ default: 'basic' })
  subscriptionPlan: string;

  @Column({ nullable: true })
  subscriptionExpiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  walletAddress: string;

  @Column({ default: 0 })
  tokenBalance: number;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ nullable: true, unique: true })
  privyId: string;

  @OneToMany(() => Card, (card) => card.user)
  cards: Card[];

  @Column({ nullable: true })
  mainCardId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
