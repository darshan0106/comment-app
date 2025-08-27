// backend/src/entities/comment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Tree,
  TreeParent,
  TreeChildren,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity'; // Import User entity

@Entity()
@Tree('closure-table') // Enables nested (tree-like) structure for comments
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date; // For edit tracking

  @Column({ default: false })
  isDeleted: boolean; // Soft delete

  @Column({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string; // Column to store the ID of the user who posted the comment

  // For nested comments:
  @TreeParent()
  parent: Comment;

  @TreeChildren({ cascade: ['insert', 'update'] }) // When a parent is saved, children are also saved
  children: Comment[];
}
