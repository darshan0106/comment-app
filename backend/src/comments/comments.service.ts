// backend/src/comments/comments.service.ts
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
    private commentsRepository: TreeRepository<Comment>, // Use TreeRepository for comments
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new comment or reply to an existing one.
   */
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

      // **NOTIFICATION LOGIC STARTS HERE**
      // Check if the replying user is different from the parent comment's author
      if (parentComment.userId !== userId) {
        await this.notificationsService.createNotification(
          parentComment.userId, // Recipient: author of the parent comment
          userId, // Replying user: current user
          parentComment.id, // ID of the comment that was replied to
        );
      }
      // **NOTIFICATION LOGIC ENDS HERE**
    }

    return this.commentsRepository.save(comment);
  }

  async getCommentById(commentId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'], // Include user details
    });
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
    return comment;
  }

  /**
   * Get all comments, including nested replies, filtered for non-deleted.
   * Can fetch only top-level comments or a specific comment's children.
   */
  async getComments(
    parentId?: string,
    page: number = 1, // Default to page 1
    limit: number = 10, // Default to 10 items per page
  ): Promise<Pagination<Comment>> {
    let commentsToProcess: Comment[] = [];
    let totalComments = 0;

    if (parentId) {
      // When fetching replies for a specific parent, we still fetch the full tree
      // but we'll only paginate at the root level if you wanted to paginate replies directly.
      // For now, let's assume `getComments(parentId)` means "get all replies to this parent".
      // If the intention is to paginate the *direct* children of a parent, the logic changes.
      // For simplicity with TreeRepository, we'll fetch the whole branch and then potentially
      // paginate its immediate children, or return all if that's the desired behavior.
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

      // Filter the full tree first
      const filteredTree = this.filterDeletedComments([fullTree]);

      // If you specifically want to paginate the *direct children* of the parent:
      if (filteredTree.length > 0 && filteredTree[0].children) {
        commentsToProcess = filteredTree[0].children;
        totalComments = commentsToProcess.length; // Total direct children
        // Apply manual pagination to direct children
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        commentsToProcess = commentsToProcess.slice(startIndex, endIndex);
      } else {
        commentsToProcess = [];
        totalComments = 0;
      }
    } else {
      // Get all top-level comments and their descendants with pagination
      const queryBuilder = this.commentsRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.children', 'children') // Include direct children for filtering
        .where('comment.parent IS NULL') // Only top-level comments
        .andWhere('comment.isDeleted = :isDeleted', { isDeleted: false }); // Filter out deleted top-level comments

      // Get total count of non-deleted top-level comments
      totalComments = await queryBuilder.getCount();

      // Apply pagination for top-level comments
      const paginatedTopLevelComments = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      // For each paginated top-level comment, load its full tree
      commentsToProcess = await Promise.all(
        paginatedTopLevelComments.map(async (topComment) => {
          return this.commentsRepository.findDescendantsTree(topComment, {
            relations: ['user', 'children'],
          });
        }),
      );
      // Then filter out deleted comments recursively
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

  // Helper method to recursively filter out deleted comments from a tree structure.
  // This traverses the tree and removes nodes where isDeleted is true.
  private filterDeletedComments(comments: Comment[]): Comment[] {
    if (!comments) {
      return [];
    }
    const filtered: Comment[] = [];
    for (const comment of comments) {
      if (comment.isDeleted) {
        continue; // Skip this deleted comment
      }
      // If the comment is not deleted, add it to the filtered list
      const commentCopy = { ...comment }; // Create a shallow copy to modify children without affecting original
      if (commentCopy.children && commentCopy.children.length > 0) {
        commentCopy.children = this.filterDeletedComments(commentCopy.children);
      }
      filtered.push(commentCopy);
    }
    return filtered;
  }

  /**
   * Edit a comment within 15 minutes of posting.
   */
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

  /**
   * Soft delete a comment.
   */
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
    comment.deletedAt = new Date(); // Record deletion time for grace period
    await this.commentsRepository.save(comment);
  }

  /**
   * Restore a soft-deleted comment within 15 minutes.
   */
  async restoreComment(commentId: string, userId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      withDeleted: true, // Crucial: include soft-deleted comments in the search
      relations: ['user'], // To check ownership
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    // Check if the user is the author of the comment
    if (comment.userId !== userId) {
      // In a real app, you'd also check for an 'admin' role
      throw new ForbiddenException(
        'You are not authorized to restore this comment.',
      );
    }

    if (!comment.isDeleted) {
      throw new ForbiddenException(
        'Comment is not soft-deleted and cannot be restored.',
      );
    }

    // Check if within the 30-day restoration window
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (comment.deletedAt && comment.deletedAt < fifteenMinutesAgo) {
      throw new ForbiddenException(
        'Comments can only be restored within 15 minutes of deletion.',
      );
    }

    comment.isDeleted = false;
    comment.deletedAt = null; // Clear the deletion timestamp
    return this.commentsRepository.save(comment);
  }
}
