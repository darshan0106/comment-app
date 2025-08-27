import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { AuthenticatedRequest } from '../auth/jwt.strategy';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('unread')
  @HttpCode(HttpStatus.OK)
  async getUnread(
    @Req() req: AuthenticatedRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const parsedPage = parseInt(page as any, 10);
    const parsedLimit = parseInt(limit as any, 10);
    return this.notificationsService.getUnreadNotifications(
      req.user.id,
      parsedPage,
      parsedLimit,
    );
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Req() req: AuthenticatedRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const parsedPage = parseInt(page as any, 10);
    const parsedLimit = parseInt(limit as any, 10);
    return this.notificationsService.getAllNotifications(
      req.user.id,
      parsedPage,
      parsedLimit,
    );
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
