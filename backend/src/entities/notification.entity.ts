// backend/src/entities/notification.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string; // e.g., "Your comment was replied to by [username]"

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User; // The user who receives the notification

  @Column()
  userId: string; // Foreign key for the recipient user

  @ManyToOne(() => Comment, (comment) => comment.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  comment: Comment; // The comment that was replied to (if any)

  @Column({ nullable: true })
  commentId: string | null; // Foreign key for the related comment
}
