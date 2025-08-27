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
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { AuthenticatedRequest } from '../auth/jwt.strategy';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Param('id') id: string) {
    return this.commentsService.getCommentById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getComments(@Query('parentId') parentId?: string) {
    return this.commentsService.getComments(parentId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCommentDto: CreateCommentDto,
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
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
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
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.commentsService.deleteComment(id, userId);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async restoreComment(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.restoreComment(id, req.user.id);
  }
}
