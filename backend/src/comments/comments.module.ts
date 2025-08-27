// backend/src/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from '../entities/comment.entity'; // Import Comment entity
import { AuthModule } from '../auth/auth.module'; // Import AuthModule
import { NotificationsModule } from '../notifications/notifications.module';
import { CommentCleanupService } from './comment-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]), // Register Comment entity with this module
    AuthModule, // Import AuthModule to use AuthGuard and JWT
    NotificationsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentCleanupService],
})
export class CommentsModule {}
