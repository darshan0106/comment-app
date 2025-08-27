import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { Comment } from '../entities/comment.entity';
import { Pagination } from '../common/interfaces/pagination.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async createNotification(
    recipientUserId: string,
    replyingUserId: string,
    commentId: string,
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
      throw new NotFoundException(
        'Required user or comment for notification not found.',
      );
    }

    const message = `${replyingUser.email} replied to your comment: "${repliedToComment.content.substring(0, 50)}..."`;

    const notification = this.notificationsRepository.create({
      userId: recipientUser.id,
      message,
      commentId: repliedToComment.id,
      isRead: false,
    });

    return this.notificationsRepository.save(notification);
  }

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
