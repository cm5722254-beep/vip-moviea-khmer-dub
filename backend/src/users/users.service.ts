import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, PaginationDto } from './users.dto';
import { User, Wallet, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User & { wallet: Wallet | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { wallet: true },
    });

    if (!user) {
      throw new NotFoundException('រកមិនឃើញអ្នកប្រើប្រាស់');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        languageCode: dto.languageCode,
        preferences: dto.preferences ? (JSON.parse(dto.preferences) as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async getPurchases(userId: string, query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              movie: {
                select: {
                  id: true,
                  titleKh: true,
                  titleEn: true,
                  posterUrl: true,
                },
              },
              episode: {
                select: {
                  id: true,
                  episodeNumber: true,
                  titleKh: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.purchase.count({ where: { userId } }),
    ]);

    return {
      items: purchases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWatchHistory(userId: string, query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { watchedAt: 'desc' },
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
            },
          },
        },
      }),
      this.prisma.watchHistory.count({ where: { userId } }),
    ]);

    return {
      items: history,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: {
          select: { balance: true },
        },
        _count: {
          select: {
            purchases: true,
            favorites: true,
            watchHistory: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('រកមិនឃើញអ្នកប្រើប្រាស់');
    }

    return user;
  }
}
