import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { TelegramGuard } from '../auth/telegram.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MoviesQueryDto, SearchMoviesDto } from './movies.dto';
import { User } from '@prisma/client';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll(@Query() query: MoviesQueryDto) {
    return this.moviesService.findAll(query);
  }

  @Get('search')
  search(@Query() query: SearchMoviesDto) {
    return this.moviesService.search(query);
  }

  @Get('popular')
  findPopular(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.moviesService.findPopular(limit);
  }

  @Get('new')
  findNew(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.moviesService.findNew(limit);
  }

  @Get('featured')
  findFeatured(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.moviesService.findFeatured(limit);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.findById(id);
  }

  @Get(':id/episodes')
  getEpisodes(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.getEpisodes(id);
  }

  @Get(':id/watch')
  @UseGuards(TelegramGuard)
  getWatchUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.moviesService.getWatchUrl(id, user.id);
  }

  @Get(':id/episodes/:episodeId/watch')
  @UseGuards(TelegramGuard)
  getEpisodeWatchUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @CurrentUser() user: User,
  ) {
    return this.moviesService.getEpisodeWatchUrl(id, episodeId, user.id);
  }
}
