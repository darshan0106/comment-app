import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from '../entities/comment.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommentCleanupService } from './comment-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentCleanupService],
})
export class CommentsModule {}
