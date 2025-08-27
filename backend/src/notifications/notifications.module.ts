// backend/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity'; // Important for fetching user details
import { Comment } from '../entities/comment.entity'; // Important for fetching comment details
import { AuthModule } from '../auth/auth.module'; // To use AuthGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, Comment]), // Register all required entities
    AuthModule, // Import AuthModule for authentication
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // Export the service so CommentsModule can use it
})
export class NotificationsModule {}
