import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramGuard } from '../auth/telegram.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto, PaginationDto } from './users.dto';
import { User } from '@prisma/client';

@Controller('users')
@UseGuards(TelegramGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Get('me/purchases')
  getPurchases(@CurrentUser() user: User, @Query() query: PaginationDto) {
    return this.usersService.getPurchases(user.id, query);
  }

  @Get('me/watch-history')
  getWatchHistory(@CurrentUser() user: User, @Query() query: PaginationDto) {
    return this.usersService.getWatchHistory(user.id, query);
  }
}
