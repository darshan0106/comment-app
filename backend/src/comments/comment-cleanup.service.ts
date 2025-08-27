// backend/src/comments/comment-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentCleanupService {
  private readonly logger = new Logger(CommentCleanupService.name);

  constructor(
    @InjectRepository(Comment)
    private commentsRepository: TreeRepository<Comment>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM) // Runs every day at 3 AM
  async handleCron() {
    this.logger.log('Running daily comment cleanup job...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Find comments that are soft-deleted AND were deleted more than 30 days ago
      const commentsToDelete = await this.commentsRepository
        .createQueryBuilder('comment')
        .withDeleted() // Important to include soft-deleted comments
        .where('comment.isDeleted = :isDeleted', { isDeleted: true })
        .andWhere('comment.deletedAt < :thirtyDaysAgo', { thirtyDaysAgo })
        .getMany();

      if (commentsToDelete.length > 0) {
        // Remove the comments permanently
        // Note: remove will also remove nested children if using onDelete: CASCADE on parent relation
        // However, with TreeRepository, it's safer to delete them individually or use a specific query.
        // For simplicity and relying on TypeORM's cascade, we'll try `remove`.
        // Alternatively, use `delete` with a query builder for potentially better performance on large sets.

        // Using remove for cascade behavior with relations defined (e.g. notifications)
        await this.commentsRepository.remove(commentsToDelete);
        this.logger.log(
          `Cleaned up ${commentsToDelete.length} permanently deleted comments.`,
        );
      } else {
        this.logger.log('No comments found for permanent cleanup.');
      }
    } catch (error) {
      this.logger.error('Error during comment cleanup cron job:', error.stack);
    }
  }
}
