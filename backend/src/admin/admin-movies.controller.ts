import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminMoviesService } from './admin-movies.service';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { AuditService } from '../audit/audit.service';
import {
  CreateMovieDto,
  UpdateMovieDto,
  CreateEpisodeDto,
  UpdateEpisodeDto,
  MoviesFilterDto,
} from './dto/admin-movies.dto';
import { Admin, VideoQuality } from '@prisma/client';

@Controller('admin/movies')
@UseGuards(AdminGuard)
export class AdminMoviesController {
  constructor(
    private readonly adminMoviesService: AdminMoviesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(@Query() query: MoviesFilterDto) {
    return this.adminMoviesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminMoviesService.findOne(id);
  }

  @Post()
  async create(@CurrentAdmin() admin: Admin, @Body() dto: CreateMovieDto) {
    const movie = await this.adminMoviesService.create(dto);
    await this.auditService.createLog(admin.id, 'CREATE', 'Movie', movie.id, null, movie);
    return movie;
  }

  @Patch(':id')
  async update(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMovieDto,
  ) {
    const old = await this.adminMoviesService.findOne(id);
    const updated = await this.adminMoviesService.update(id, dto);
    await this.auditService.createLog(admin.id, 'UPDATE', 'Movie', id, old, updated);
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentAdmin() admin: Admin, @Param('id', ParseUUIDPipe) id: string) {
    const old = await this.adminMoviesService.findOne(id);
    await this.adminMoviesService.delete(id);
    await this.auditService.createLog(admin.id, 'DELETE', 'Movie', id, old, null);
    return { message: 'ភាពយន្តបានលុបជោគជ័យ' };
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(@CurrentAdmin() admin: Admin, @Param('id', ParseUUIDPipe) id: string) {
    const movie = await this.adminMoviesService.publish(id);
    await this.auditService.createLog(admin.id, 'PUBLISH', 'Movie', id, null, { status: movie.status });
    return movie;
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  async unpublish(@CurrentAdmin() admin: Admin, @Param('id', ParseUUIDPipe) id: string) {
    const movie = await this.adminMoviesService.unpublish(id);
    await this.auditService.createLog(admin.id, 'UNPUBLISH', 'Movie', id, null, { status: movie.status });
    return movie;
  }

  @Post(':id/episodes')
  async createEpisode(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEpisodeDto,
  ) {
    const episode = await this.adminMoviesService.createEpisode(id, dto);
    await this.auditService.createLog(admin.id, 'CREATE', 'Episode', episode.id, null, episode);
    return episode;
  }

  @Patch(':id/episodes/:epId')
  async updateEpisode(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('epId', ParseUUIDPipe) epId: string,
    @Body() dto: UpdateEpisodeDto,
  ) {
    const updated = await this.adminMoviesService.updateEpisode(id, epId, dto);
    await this.auditService.createLog(admin.id, 'UPDATE', 'Episode', epId, null, updated);
    return updated;
  }

  @Delete(':id/episodes/:epId')
  @HttpCode(HttpStatus.OK)
  async deleteEpisode(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('epId', ParseUUIDPipe) epId: string,
  ) {
    await this.adminMoviesService.deleteEpisode(id, epId);
    await this.auditService.createLog(admin.id, 'DELETE', 'Episode', epId, null, null);
    return { message: 'វគ្គបានលុបជោគជ័យ' };
  }

  @Post(':id/episodes/:epId/upload')
  @UseInterceptors(FileInterceptor('video', { limits: { fileSize: 10 * 1024 * 1024 * 1024 } }))
  async uploadEpisodeVideo(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('epId', ParseUUIDPipe) epId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('quality') quality: VideoQuality,
  ) {
    const result = await this.adminMoviesService.uploadEpisodeVideo(id, epId, file, quality);
    await this.auditService.createLog(admin.id, 'UPLOAD_VIDEO', 'Episode', epId, null, { quality });
    return result;
  }
}
