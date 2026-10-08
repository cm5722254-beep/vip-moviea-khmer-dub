import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveProgressDto } from './watch-progress.dto';

@Injectable()
export class WatchProgressService {
  constructor(private prisma: PrismaService) {}

  async saveProgress(userId: string, dto: SaveProgressDto) {
    const progress = await this.prisma.watchProgress.upsert({
      where: {
        userId_episodeId: {
          userId,
          episodeId: dto.episodeId,
        },
      },
      create: {
        userId,
        movieId: dto.movieId,
        episodeId: dto.episodeId,
        progressSeconds: dto.progressSeconds,
        durationSeconds: dto.durationSeconds,
        percentage: dto.durationSeconds > 0
          ? Math.round((dto.progressSeconds / dto.durationSeconds) * 100)
          : 0,
        isCompleted: dto.durationSeconds > 0
          ? (dto.progressSeconds / dto.durationSeconds) >= 0.9
          : false,
      },
      update: {
        progressSeconds: dto.progressSeconds,
        durationSeconds: dto.durationSeconds,
        percentage: dto.durationSeconds > 0
          ? Math.round((dto.progressSeconds / dto.durationSeconds) * 100)
          : 0,
        isCompleted: dto.durationSeconds > 0
          ? (dto.progressSeconds / dto.durationSeconds) >= 0.9
          : false,
        lastWatchedAt: new Date(),
      },
    });

    return progress;
  }

  async getProgressForEpisode(userId: string, episodeId: string) {
    const progress = await this.prisma.watchProgress.findUnique({
      where: { userId_episodeId: { userId, episodeId } },
    });

    return progress || { progressSeconds: 0, percentage: 0, isCompleted: false };
  }

  async getContinueWatching(userId: string) {
    const progresses = await this.prisma.watchProgress.findMany({
      where: {
        userId,
        isCompleted: false,
        progressSeconds: { gt: 0 },
      },
      orderBy: { lastWatchedAt: 'desc' },
      take: 20,
      include: {
        movie: {
          select: {
            id: true,
            titleKh: true,
            titleEn: true,
            posterUrl: true,
            totalEpisodes: true,
          },
        },
        episode: {
          select: {
            id: true,
            episodeNumber: true,
            titleKh: true,
            duration: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return progresses;
  }
}
