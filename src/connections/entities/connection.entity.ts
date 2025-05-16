import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('connections')
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The first user in the connection
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @Column()
  user1Id: string;

  // The second user in the connection
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @Column()
  user2Id: string;

  // Notes from user1 about user2
  @Column({ nullable: true, default: null })
  user1Notes: string;

  // Notes from user2 about user1
  @Column({ nullable: true, default: null })
  user2Notes: string;

  // Whether user1 has favorited user2
  @Column({ default: false })
  user1FavoritedUser2: boolean;

  // Whether user2 has favorited user1
  @Column({ default: false })
  user2FavoritedUser1: boolean;

  // The date when the connection was established
  @Column()
  connectionDate: Date;

  // The date of the last interaction between the users
  @Column({ nullable: true, default: null })
  lastInteractionDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
