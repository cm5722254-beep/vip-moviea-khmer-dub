import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositStatus, MovieStatus, PurchaseStatus, UserStatus } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      newUsersToday,
      newUsersThisMonth,
      totalMovies,
      publishedMovies,
      totalRevenue,
      monthlyRevenue,
      pendingDeposits,
      totalDeposits,
      totalPurchases,
      recentPurchases,
      topMovies,
      recentDeposits,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.movie.count(),
      this.prisma.movie.count({ where: { status: MovieStatus.PUBLISHED } }),
      this.prisma.purchase.aggregate({
        _sum: { finalAmount: true },
        where: { status: PurchaseStatus.COMPLETED },
      }),
      this.prisma.purchase.aggregate({
        _sum: { finalAmount: true },
        where: {
          status: PurchaseStatus.COMPLETED,
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.deposit.count({ where: { status: DepositStatus.PENDING } }),
      this.prisma.deposit.aggregate({
        _sum: { amount: true },
        where: { status: DepositStatus.APPROVED },
      }),
      this.prisma.purchase.count({ where: { status: PurchaseStatus.COMPLETED } }),
      this.prisma.purchase.findMany({
        where: { status: PurchaseStatus.COMPLETED },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, firstName: true } },
          items: {
            include: {
              movie: { select: { titleKh: true } },
            },
          },
        },
      }),
      this.prisma.movie.findMany({
        where: { status: MovieStatus.PUBLISHED },
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: { id: true, titleKh: true, viewCount: true, likeCount: true },
      }),
      this.prisma.deposit.findMany({
        where: { status: DepositStatus.PENDING },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, firstName: true } },
          paymentMethod: { select: { nameKh: true } },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth,
      },
      movies: {
        total: totalMovies,
        published: publishedMovies,
        draft: totalMovies - publishedMovies,
      },
      revenue: {
        total: totalRevenue._sum.finalAmount || 0,
        thisMonth: monthlyRevenue._sum.finalAmount || 0,
      },
      deposits: {
        totalApproved: totalDeposits._sum.amount || 0,
        pendingCount: pendingDeposits,
      },
      purchases: {
        total: totalPurchases,
      },
      recentPurchases,
      topMovies,
      pendingDeposits: recentDeposits,
    };
  }
}
