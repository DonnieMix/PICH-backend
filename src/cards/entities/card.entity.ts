import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Connection } from '../../connections/entities/connection.entity';

export enum CardType {
  BAC = 'BAC', // Business Automatic Card
  PAC = 'PAC', // Personal Automatic Card
  VAC = 'VAC', // Virtual Automatic Card
  CAC = 'CAC', // Custom Automatic Card
}

export enum CardCategory {
  FAMILY = 'FAMILY',
  FRIENDS = 'FRIENDS',
  WORK = 'WORK',
  OTHER = 'OTHER',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CardType,
    default: CardType.PAC,
  })
  type: CardType;

  @Column()
  name: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'json', nullable: true })
  social: Record<string, string>;

  @Column({ default: false })
  isPrime: boolean;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'json', nullable: true })
  location: {
    country?: string;
    city?: string;
    address?: string;
    postalCode?: string;
  };

  @Column({
    type: 'enum',
    enum: CardCategory,
    default: CardCategory.OTHER,
  })
  category: CardCategory;

  @Column({ nullable: true })
  blockchainId: string;

  @ManyToOne(() => User, (user) => user.cards)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Connection, (connection) => connection.card)
  connections: Connection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
