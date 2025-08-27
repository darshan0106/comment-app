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

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron() {
    this.logger.log('Running daily comment cleanup job...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const commentsToDelete = await this.commentsRepository
        .createQueryBuilder('comment')
        .withDeleted()
        .where('comment.isDeleted = :isDeleted', { isDeleted: true })
        .andWhere('comment.deletedAt < :thirtyDaysAgo', { thirtyDaysAgo })
        .getMany();

      if (commentsToDelete.length > 0) {
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
