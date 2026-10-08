import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WatchProgressService } from './watch-progress.service';
import { TelegramGuard } from '../auth/telegram.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SaveProgressDto } from './watch-progress.dto';
import { User } from '@prisma/client';

@Controller('watch-progress')
@UseGuards(TelegramGuard)
export class WatchProgressController {
  constructor(private readonly watchProgressService: WatchProgressService) {}

  @Post()
  saveProgress(@CurrentUser() user: User, @Body() dto: SaveProgressDto) {
    return this.watchProgressService.saveProgress(user.id, dto);
  }

  @Get('continue')
  getContinueWatching(@CurrentUser() user: User) {
    return this.watchProgressService.getContinueWatching(user.id);
  }

  @Get(':episodeId')
  getProgress(
    @CurrentUser() user: User,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
  ) {
    return this.watchProgressService.getProgressForEpisode(user.id, episodeId);
  }
}
