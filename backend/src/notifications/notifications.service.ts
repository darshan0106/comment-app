// backend/src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity'; // To get user data for message
import { Comment } from '../entities/comment.entity'; // To get comment data for message
import { Pagination } from '../common/interfaces/pagination.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>, // Inject Comment repo to fetch parent
  ) {}

  /**
   * Create a notification for a user.
   * This will be called internally when a comment is replied to.
   */
  async createNotification(
    recipientUserId: string,
    replyingUserId: string,
    commentId: string, // The ID of the comment that was replied to
  ): Promise<Notification> {
    const recipientUser = await this.usersRepository.findOne({
      where: { id: recipientUserId },
    });
    const replyingUser = await this.usersRepository.findOne({
      where: { id: replyingUserId },
    });
    const repliedToComment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!recipientUser || !replyingUser || !repliedToComment) {
      // This should ideally not happen if calling service correctly, but good for safety
      throw new NotFoundException(
        'Required user or comment for notification not found.',
      );
    }

    const message = `${replyingUser.email} replied to your comment: "${repliedToComment.content.substring(0, 50)}..."`; // Truncate content

    const notification = this.notificationsRepository.create({
      userId: recipientUser.id,
      message,
      commentId: repliedToComment.id,
      isRead: false,
    });

    return this.notificationsRepository.save(notification);
  }

  /**
   * Get all unread notifications for a specific user.
   */
  async getUnreadNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<Pagination<Notification>> {
    const [data, total] = await this.notificationsRepository.findAndCount({
      where: { userId, isRead: false },
      relations: ['comment'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page * limit < total;
    const hasPreviousPage = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  /**
   * Get all notifications for a specific user (read and unread).
   */
  async getAllNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<Pagination<Notification>> {
    const [data, total] = await this.notificationsRepository.findAndCount({
      where: { userId },
      relations: ['comment'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page * limit < total;
    const hasPreviousPage = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, userId: userId },
    });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found or you are not the recipient.',
      );
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }
}
