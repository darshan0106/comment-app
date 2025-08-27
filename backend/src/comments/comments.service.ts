import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Pagination } from '../common/interfaces/pagination.interface';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: TreeRepository<Comment>,
    private notificationsService: NotificationsService,
  ) {}

  async createComment(
    content: string,
    userId: string,
    parentId?: string,
  ): Promise<Comment> {
    const comment = new Comment();
    comment.content = content;
    comment.userId = userId;

    if (parentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: parentId },
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found.');
      }
      comment.parent = parentComment;

      if (parentComment.userId !== userId) {
        await this.notificationsService.createNotification(
          parentComment.userId,
          userId,
          parentComment.id,
        );
      }
    }

    return this.commentsRepository.save(comment);
  }

  async getCommentById(commentId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
    return comment;
  }

  async getComments(
    parentId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<Pagination<Comment>> {
    let commentsToProcess: Comment[] = [];
    let totalComments = 0;

    if (parentId) {
      const parentCommentTree = await this.commentsRepository.findOne({
        where: { id: parentId },
      });
      if (!parentCommentTree) {
        throw new NotFoundException('Parent comment not found.');
      }
      const fullTree = await this.commentsRepository.findDescendantsTree(
        parentCommentTree,
        {
          relations: ['user', 'children'],
        },
      );

      const filteredTree = this.filterDeletedComments([fullTree]);

      if (filteredTree.length > 0 && filteredTree[0].children) {
        commentsToProcess = filteredTree[0].children;
        totalComments = commentsToProcess.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        commentsToProcess = commentsToProcess.slice(startIndex, endIndex);
      } else {
        commentsToProcess = [];
        totalComments = 0;
      }
    } else {
      const queryBuilder = this.commentsRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.children', 'children')
        .where('comment.parent IS NULL')
        .andWhere('comment.isDeleted = :isDeleted', { isDeleted: false });

      totalComments = await queryBuilder.getCount();

      const paginatedTopLevelComments = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      commentsToProcess = await Promise.all(
        paginatedTopLevelComments.map(async (topComment) => {
          return this.commentsRepository.findDescendantsTree(topComment, {
            relations: ['user', 'children'],
          });
        }),
      );
      commentsToProcess = this.filterDeletedComments(commentsToProcess);
    }

    const totalPages = Math.ceil(totalComments / limit);
    const hasNextPage = page * limit < totalComments;
    const hasPreviousPage = page > 1;

    return {
      data: commentsToProcess,
      total: totalComments,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  private filterDeletedComments(comments: Comment[]): Comment[] {
    if (!comments) {
      return [];
    }
    const filtered: Comment[] = [];
    for (const comment of comments) {
      if (comment.isDeleted) {
        continue;
      }
      const commentCopy = { ...comment };
      if (commentCopy.children && commentCopy.children.length > 0) {
        commentCopy.children = this.filterDeletedComments(commentCopy.children);
      }
      filtered.push(commentCopy);
    }
    return filtered;
  }

  async editComment(
    commentId: string,
    content: string,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, userId: userId, isDeleted: false },
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or you are not the author.',
      );
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (comment.createdAt < fifteenMinutesAgo) {
      throw new ForbiddenException(
        'Comments can only be edited within 15 minutes of posting.',
      );
    }

    comment.content = content;
    return this.commentsRepository.save(comment);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, userId: userId, isDeleted: false },
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or you are not the author.',
      );
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await this.commentsRepository.save(comment);
  }

  async restoreComment(commentId: string, userId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      withDeleted: true,
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to restore this comment.',
      );
    }

    if (!comment.isDeleted) {
      throw new ForbiddenException(
        'Comment is not soft-deleted and cannot be restored.',
      );
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (comment.deletedAt && comment.deletedAt < fifteenMinutesAgo) {
      throw new ForbiddenException(
        'Comments can only be restored within 15 minutes of deletion.',
      );
    }

    comment.isDeleted = false;
    comment.deletedAt = null;
    return this.commentsRepository.save(comment);
  }
}
