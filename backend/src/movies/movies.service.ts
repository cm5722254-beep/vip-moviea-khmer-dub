import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MoviesQueryDto, SearchMoviesDto } from './movies.dto';
import { MovieStatus, PurchaseType, PurchaseStatus } from '@prisma/client';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  private movieSelect = {
    id: true,
    titleKh: true,
    titleEn: true,
    descriptionKh: true,
    descriptionEn: true,
    posterUrl: true,
    bannerUrl: true,
    trailerUrl: true,
    releaseYear: true,
    duration: true,
    totalEpisodes: true,
    viewCount: true,
    likeCount: true,
    averageRating: true,
    isFree: true,
    price: true,
    episodePrice: true,
    status: true,
    isFeatured: true,
    isHot: true,
    isNew: true,
    createdAt: true,
    category: {
      select: { id: true, nameKh: true, nameEn: true, slug: true },
    },
    tags: {
      select: { tag: { select: { id: true, nameKh: true, nameEn: true } } },
    },
  };

  async findAll(query: MoviesQueryDto) {
    const { page = 1, limit = 20, categoryId, tag, isFree, sortBy } = query;
    const skip = (page - 1) * limit;

    const where: object = {
      status: MovieStatus.PUBLISHED,
      ...(categoryId && { categoryId }),
      ...(isFree !== undefined && { isFree }),
      ...(tag && { tags: { some: { tag: { nameEn: tag } } } }),
    };

    let orderBy: object = { createdAt: 'desc' };
    if (sortBy === 'popular') orderBy = { viewCount: 'desc' };
    if (sortBy === 'rating') orderBy = { averageRating: 'desc' };

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: this.movieSelect,
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      items: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async search(query: SearchMoviesDto) {
    const { q, categoryId, tag, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: object = {
      status: MovieStatus.PUBLISHED,
      ...(categoryId && { categoryId }),
      ...(tag && { tags: { some: { tag: { nameEn: tag } } } }),
      ...(q && {
        OR: [
          { titleKh: { contains: q, mode: 'insensitive' } },
          { titleEn: { contains: q, mode: 'insensitive' } },
          { descriptionKh: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { viewCount: 'desc' },
        select: this.movieSelect,
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      items: movies,
      query: q,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPopular(limit = 10) {
    return this.prisma.movie.findMany({
      where: { status: MovieStatus.PUBLISHED },
      take: limit,
      orderBy: { viewCount: 'desc' },
      select: this.movieSelect,
    });
  }

  async findNew(limit = 10) {
    return this.prisma.movie.findMany({
      where: { status: MovieStatus.PUBLISHED, isNew: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: this.movieSelect,
    });
  }

  async findFeatured(limit = 5) {
    return this.prisma.movie.findMany({
      where: { status: MovieStatus.PUBLISHED, isFeatured: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: this.movieSelect,
    });
  }

  async findById(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      select: {
        ...this.movieSelect,
        _count: { select: { episodes: true, favorites: true } },
      },
    });

    if (!movie || movie.status !== MovieStatus.PUBLISHED) {
      throw new NotFoundException('រកមិនឃើញភាពយន្ត');
    }

    // Increment view count asynchronously
    this.prisma.movie.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch((err) => this.logger.error('Failed to increment view count', err));

    return movie;
  }

  async getEpisodes(movieId: string) {
    await this.findById(movieId);

    return this.prisma.episode.findMany({
      where: { movieId, isPublished: true },
      orderBy: { episodeNumber: 'asc' },
      select: {
        id: true,
        episodeNumber: true,
        titleKh: true,
        titleEn: true,
        duration: true,
        thumbnailUrl: true,
        isFree: true,
        price: true,
        airDate: true,
        viewCount: true,
      },
    });
  }

  async getWatchUrl(movieId: string, userId: string): Promise<{ url: string; expiresIn: number }> {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        videoAssets: { where: { isActive: true }, take: 1 },
      },
    });

    if (!movie || movie.status !== MovieStatus.PUBLISHED) {
      throw new NotFoundException('រកមិនឃើញភាពយន្ត');
    }

    if (!movie.isFree) {
      const hasPurchase = await this.prisma.purchaseItem.findFirst({
        where: {
          movieId,
          purchase: {
            userId,
            status: PurchaseStatus.COMPLETED,
          },
          type: PurchaseType.MOVIE,
        },
      });

      if (!hasPurchase) {
        throw new ForbiddenException('អ្នកមិនទាន់បានទិញភាពយន្តនេះ');
      }
    }

    const videoAsset = movie.videoAssets[0];
    if (!videoAsset || !videoAsset.storageKey) {
      throw new NotFoundException('ឯកសារវីដេអូរកមិនឃើញ');
    }

    const url = await this.storageService.generateSignedUrl(videoAsset.storageKey, 3600);

    // Track watch history
    this.prisma.watchHistory.upsert({
      where: { userId_movieId: { userId, movieId } },
      create: { userId, movieId, watchedAt: new Date() },
      update: { watchedAt: new Date() },
    }).catch((err) => this.logger.error('Failed to record watch history', err));

    return { url, expiresIn: 3600 };
  }

  async getEpisodeWatchUrl(
    movieId: string,
    episodeId: string,
    userId: string,
  ): Promise<{ url: string; expiresIn: number }> {
    const episode = await this.prisma.episode.findFirst({
      where: { id: episodeId, movieId, isPublished: true },
      include: {
        videoAssets: { where: { isActive: true }, take: 1 },
      },
    });

    if (!episode) {
      throw new NotFoundException('រកមិនឃើញវគ្គ');
    }

    if (!episode.isFree) {
      // Check movie purchase first
      const hasMoviePurchase = await this.prisma.purchaseItem.findFirst({
        where: {
          movieId,
          purchase: { userId, status: PurchaseStatus.COMPLETED },
          type: PurchaseType.MOVIE,
        },
      });

      if (!hasMoviePurchase) {
        // Check episode purchase
        const hasEpisodePurchase = await this.prisma.purchaseItem.findFirst({
          where: {
            episodeId,
            purchase: { userId, status: PurchaseStatus.COMPLETED },
            type: PurchaseType.EPISODE,
          },
        });

        if (!hasEpisodePurchase) {
          throw new ForbiddenException('អ្នកមិនទាន់បានទិញវគ្គនេះ');
        }
      }
    }

    const videoAsset = episode.videoAssets[0];
    if (!videoAsset || !videoAsset.storageKey) {
      throw new NotFoundException('ឯកសារវីដេអូរកមិនឃើញ');
    }

    const url = await this.storageService.generateSignedUrl(videoAsset.storageKey, 3600);

    // Track watch history for episode
    this.prisma.watchHistory.upsert({
      where: { userId_movieId: { userId, movieId } },
      create: { userId, movieId, episodeId, watchedAt: new Date() },
      update: { episodeId, watchedAt: new Date() },
    }).catch((err) => this.logger.error('Failed to record episode watch history', err));

    return { url, expiresIn: 3600 };
  }
}
