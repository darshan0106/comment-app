// backend/src/comments/comments.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
// Import your new, validated DTOs
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { AuthenticatedRequest } from '../auth/jwt.strategy';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  // **NEW** - Endpoint to get a single comment by ID
  // This should be public, so we place it before the @UseGuards
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Param('id') id: string) {
    return this.commentsService.getCommentById(id);
  }

  // **NEW** - Endpoint to get comments (top-level or replies)
  // This is also public
  @Get()
  @HttpCode(HttpStatus.OK)
  async getComments(@Query('parentId') parentId?: string) {
    // Note: The pagination logic from your original controller can be added back here if needed
    return this.commentsService.getComments(parentId);
  }

  // --- Protected Routes Below ---

  @Post()
  @UseGuards(AuthGuard('jwt')) // Protect this specific route
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCommentDto: CreateCommentDto, // USE THE VALIDATED DTO
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.commentsService.createComment(
      createCommentDto.content,
      userId,
      createCommentDto.parentId,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt')) // Protect this specific route
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto, // USE THE VALIDATED DTO
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.commentsService.editComment(
      id,
      updateCommentDto.content,
      userId,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt')) // Protect this specific route
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.commentsService.deleteComment(id, userId);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard('jwt')) // Protect this specific route
  @HttpCode(HttpStatus.OK)
  async restoreComment(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.restoreComment(id, req.user.id);
  }
}
