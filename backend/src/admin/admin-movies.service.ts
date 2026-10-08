import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  CreateMovieDto,
  UpdateMovieDto,
  CreateEpisodeDto,
  UpdateEpisodeDto,
  MoviesFilterDto,
} from './dto/admin-movies.dto';
import { MovieStatus, VideoQuality, Prisma } from '@prisma/client';

@Injectable()
export class AdminMoviesService {
  private readonly logger = new Logger(AdminMoviesService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll(query: MoviesFilterDto) {
    const { page = 1, limit = 20, status, categoryId, q } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MovieWhereInput = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(q && {
        OR: [
          { titleKh: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { titleEn: { contains: q, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, nameKh: true } },
          _count: { select: { episodes: true } },
        },
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      items: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateMovieDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('រកមិនឃើញប្រភេទ');

    const movie = await this.prisma.movie.create({
      data: {
        titleKh: dto.titleKh,
        titleEn: dto.titleEn,
        descriptionKh: dto.descriptionKh,
        descriptionEn: dto.descriptionEn,
        categoryId: dto.categoryId,
        releaseYear: dto.releaseYear,
        price: dto.price ?? 0,
        episodePrice: dto.episodePrice ?? 0,
        isFree: dto.isFree ?? false,
        isFeatured: dto.isFeatured ?? false,
        isHot: dto.isHot ?? false,
        isNew: dto.isNew ?? true,
        status: MovieStatus.DRAFT,
        ...(dto.tagIds && dto.tagIds.length > 0 && {
          tags: {
            create: dto.tagIds.map((tagId: string) => ({ tagId })),
          },
        }),
      },
    });

    return movie;
  }

  async update(id: string, dto: UpdateMovieDto) {
    await this.findOne(id);

    if (dto.tagIds !== undefined) {
      // Replace all tags
      await this.prisma.movieTag.deleteMany({ where: { movieId: id } });
    }

    return this.prisma.movie.update({
      where: { id },
      data: {
        ...(dto.titleKh && { titleKh: dto.titleKh }),
        ...(dto.titleEn !== undefined && { titleEn: dto.titleEn }),
        ...(dto.descriptionKh !== undefined && { descriptionKh: dto.descriptionKh }),
        ...(dto.descriptionEn !== undefined && { descriptionEn: dto.descriptionEn }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.episodePrice !== undefined && { episodePrice: dto.episodePrice }),
        ...(dto.isFree !== undefined && { isFree: dto.isFree }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.isHot !== undefined && { isHot: dto.isHot }),
        ...(dto.isNew !== undefined && { isNew: dto.isNew }),
        ...(dto.tagIds && dto.tagIds.length > 0 && {
          tags: {
            create: dto.tagIds.map((tagId: string) => ({ tagId })),
          },
        }),
      },
    });
  }

  async delete(id: string) {
    const movie = await this.findOne(id);

    // Delete video assets from storage
    const videoAssets = await this.prisma.videoAsset.findMany({
      where: { OR: [{ movieId: id }, { episode: { movieId: id } }] },
    });

    for (const asset of videoAssets) {
      if (asset.storageKey) {
        await this.storageService.deleteFile(asset.storageKey).catch((err: unknown) =>
          this.logger.error(`Failed to delete asset ${asset.storageKey}`, err),
        );
      }
    }

    return this.prisma.movie.delete({ where: { id } });
  }

  async publish(id: string) {
    const movie = await this.findOne(id);
    if (movie.status === MovieStatus.PUBLISHED) {
      throw new ConflictException('ភាពយន្តនេះបានបោះផ្សាយរួចហើយ');
    }

    return this.prisma.movie.update({
      where: { id },
      data: { status: MovieStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    const movie = await this.findOne(id);
    if (movie.status !== MovieStatus.PUBLISHED) {
      throw new ConflictException('ភាពយន្តនេះមិនទាន់បោះផ្សាយ');
    }

    return this.prisma.movie.update({
      where: { id },
      data: { status: MovieStatus.DRAFT },
    });
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
        episodes: { orderBy: { episodeNumber: 'asc' } },
      },
    });
    if (!movie) throw new NotFoundException('រកមិនឃើញភាពយន្ត');
    return movie;
  }

  async createEpisode(movieId: string, dto: CreateEpisodeDto) {
    await this.findOne(movieId);

    const exists = await this.prisma.episode.findUnique({
      where: { movieId_episodeNumber: { movieId, episodeNumber: dto.episodeNumber } },
    });
    if (exists) throw new ConflictException(`វគ្គ ${dto.episodeNumber} មានរួចហើយ`);

    const episode = await this.prisma.episode.create({
      data: {
        movieId,
        episodeNumber: dto.episodeNumber,
        titleKh: dto.titleKh,
        titleEn: dto.titleEn,
        duration: dto.duration ?? 0,
        isFree: dto.isFree ?? false,
        price: dto.price ?? 0,
        airDate: dto.airDate ? new Date(dto.airDate) : null,
        isPublished: false,
      },
    });

    // Update totalEpisodes
    await this.prisma.movie.update({
      where: { id: movieId },
      data: {
        totalEpisodes: await this.prisma.episode.count({ where: { movieId } }),
      },
    });

    return episode;
  }

  async updateEpisode(movieId: string, episodeId: string, dto: UpdateEpisodeDto) {
    const episode = await this.prisma.episode.findFirst({
      where: { id: episodeId, movieId },
    });
    if (!episode) throw new NotFoundException('រកមិនឃើញវគ្គ');

    return this.prisma.episode.update({
      where: { id: episodeId },
      data: {
        ...(dto.episodeNumber && { episodeNumber: dto.episodeNumber }),
        ...(dto.titleKh && { titleKh: dto.titleKh }),
        ...(dto.titleEn !== undefined && { titleEn: dto.titleEn }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.isFree !== undefined && { isFree: dto.isFree }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async deleteEpisode(movieId: string, episodeId: string) {
    const episode = await this.prisma.episode.findFirst({
      where: { id: episodeId, movieId },
      include: { videoAssets: true },
    });
    if (!episode) throw new NotFoundException('រកមិនឃើញវគ្គ');

    for (const asset of episode.videoAssets) {
      if (asset.storageKey) {
        await this.storageService.deleteFile(asset.storageKey).catch((err: unknown) =>
          this.logger.error(`Failed to delete episode asset`, err),
        );
      }
    }

    await this.prisma.episode.delete({ where: { id: episodeId } });

    // Update totalEpisodes
    await this.prisma.movie.update({
      where: { id: movieId },
      data: {
        totalEpisodes: await this.prisma.episode.count({ where: { movieId } }),
      },
    });

    return { success: true };
  }

  async uploadEpisodeVideo(
    movieId: string,
    episodeId: string,
    file: Express.Multer.File,
    quality: VideoQuality = VideoQuality.HD_720P,
  ) {
    const episode = await this.prisma.episode.findFirst({
      where: { id: episodeId, movieId },
    });
    if (!episode) throw new NotFoundException('រកមិនឃើញវគ្គ');

    if (!file) throw new BadRequestException('ឯកសារវីដេអូខ្វះ');

    const key = this.storageService.buildKey(
      `videos/${movieId}/episodes/${episodeId}`,
      file.originalname,
    );

    await this.storageService.uploadFile(key, file.buffer, file.mimetype, {
      movieId,
      episodeId,
      quality,
    });

    // Create or update video asset record
    const videoAsset = await this.prisma.videoAsset.upsert({
      where: {
        episodeId_quality: { episodeId, quality },
      },
      create: {
        episodeId,
        quality,
        storageKey: key,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        isActive: true,
      },
      update: {
        storageKey: key,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Episode video uploaded: episodeId=${episodeId}, key=${key}`);
    return { success: true, videoAssetId: videoAsset.id };
  }
}
