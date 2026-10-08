import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuyMovieDto, BuyEpisodeDto } from './purchases.dto';
import {
  MovieStatus,
  PurchaseType,
  PurchaseStatus,
  TransactionType,
  TransactionStatus,
  DiscountType,
  CouponUsage,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name);

  constructor(private prisma: PrismaService) {}

  async buyMovie(userId: string, dto: BuyMovieDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify movie exists and is published — get REAL price from DB
      const movie = await tx.movie.findUnique({
        where: { id: dto.movieId },
        select: {
          id: true,
          titleKh: true,
          status: true,
          isFree: true,
          price: true,
        },
      });

      if (!movie) {
        throw new NotFoundException('រកមិនឃើញភាពយន្ត');
      }

      if (movie.status !== MovieStatus.PUBLISHED) {
        throw new BadRequestException('ភាពយន្តនេះមិនអាចទិញបាន');
      }

      if (movie.isFree) {
        throw new BadRequestException('ភាពយន្តនេះឥតគិតថ្លៃ');
      }

      // 2. Check for duplicate purchase
      const existingPurchase = await tx.purchaseItem.findFirst({
        where: {
          movieId: dto.movieId,
          type: PurchaseType.MOVIE,
          purchase: {
            userId,
            status: PurchaseStatus.COMPLETED,
          },
        },
      });

      if (existingPurchase) {
        throw new ConflictException('អ្នកបានទិញភាពយន្តនេះរួចហើយ');
      }

      // 3. Get real price from DB — apply coupon if provided
      let finalPrice = new Decimal(movie.price || 0);
      let coupon = null;

      if (dto.couponCode) {
        coupon = await this.validateAndGetCoupon(tx, dto.couponCode, userId, finalPrice);
        if (coupon) {
          finalPrice = this.applyDiscount(finalPrice, coupon);
        }
      }

      // 4. Verify user has sufficient wallet balance
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new BadRequestException('រកមិនឃើញ wallet របស់អ្នក');
      }

      if (new Decimal(wallet.balance).lessThan(finalPrice)) {
        throw new BadRequestException(
          `សាច់ប្រាក់មិនគ្រប់គ្រាន់។ ត្រូវការ ${finalPrice} ។ មានតែ ${wallet.balance} ប៉ុណ្ណោះ`,
        );
      }

      // 5. Deduct wallet balance atomically
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: finalPrice } },
      });

      // 6. Create purchase record
      const purchase = await tx.purchase.create({
        data: {
          userId,
          totalAmount: finalPrice,
          discountAmount: new Decimal(movie.price || 0).minus(finalPrice),
          finalAmount: finalPrice,
          status: PurchaseStatus.COMPLETED,
          couponId: coupon?.id || null,
          items: {
            create: {
              movieId: dto.movieId,
              type: PurchaseType.MOVIE,
              price: finalPrice,
            },
          },
        },
        include: { items: true },
      });

      // 7. Create wallet transaction record
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.PURCHASE,
          amount: finalPrice.negated(),
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          status: TransactionStatus.COMPLETED,
          referenceId: purchase.id,
          description: `ទិញភាពយន្ត: ${movie.titleKh}`,
        },
      });

      // 8. Mark coupon as used if applied
      if (coupon) {
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId,
            purchaseId: purchase.id,
          },
        });
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      this.logger.log(`Movie purchase completed: userId=${userId}, movieId=${dto.movieId}, amount=${finalPrice}`);

      return {
        purchase,
        walletBalance: updatedWallet.balance,
      };
    });
  }

  async buyEpisode(userId: string, dto: BuyEpisodeDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get episode and verify it exists
      const episode = await tx.episode.findUnique({
        where: { id: dto.episodeId },
        select: {
          id: true,
          titleKh: true,
          isFree: true,
          price: true,
          isPublished: true,
          movieId: true,
          movie: {
            select: {
              id: true,
              status: true,
              titleKh: true,
            },
          },
        },
      });

      if (!episode || !episode.isPublished) {
        throw new NotFoundException('រកមិនឃើញវគ្គ');
      }

      if (episode.movie.status !== MovieStatus.PUBLISHED) {
        throw new BadRequestException('ភាពយន្តនេះមិនអាចទិញបាន');
      }

      if (episode.isFree) {
        throw new BadRequestException('វគ្គនេះឥតគិតថ្លៃ');
      }

      // 2. Check if user already owns the whole movie
      const hasMoviePurchase = await tx.purchaseItem.findFirst({
        where: {
          movieId: episode.movieId,
          type: PurchaseType.MOVIE,
          purchase: { userId, status: PurchaseStatus.COMPLETED },
        },
      });

      if (hasMoviePurchase) {
        throw new ConflictException('អ្នកបានទិញភាពយន្តទាំងអស់រួចហើយ');
      }

      // 3. Check duplicate episode purchase
      const existingPurchase = await tx.purchaseItem.findFirst({
        where: {
          episodeId: dto.episodeId,
          type: PurchaseType.EPISODE,
          purchase: { userId, status: PurchaseStatus.COMPLETED },
        },
      });

      if (existingPurchase) {
        throw new ConflictException('អ្នកបានទិញវគ្គនេះរួចហើយ');
      }

      // 4. Get real price from DB
      const finalPrice = new Decimal(episode.price || 0);

      // 5. Verify balance
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw new BadRequestException('រកមិនឃើញ wallet');
      }

      if (new Decimal(wallet.balance).lessThan(finalPrice)) {
        throw new BadRequestException(
          `សាច់ប្រាក់មិនគ្រប់គ្រាន់។ ត្រូវការ ${finalPrice}`,
        );
      }

      // 6. Deduct atomically
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: finalPrice } },
      });

      // 7. Create purchase
      const purchase = await tx.purchase.create({
        data: {
          userId,
          totalAmount: finalPrice,
          discountAmount: 0,
          finalAmount: finalPrice,
          status: PurchaseStatus.COMPLETED,
          items: {
            create: {
              movieId: episode.movieId,
              episodeId: dto.episodeId,
              type: PurchaseType.EPISODE,
              price: finalPrice,
            },
          },
        },
        include: { items: true },
      });

      // 8. Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.PURCHASE,
          amount: finalPrice.negated(),
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          status: TransactionStatus.COMPLETED,
          referenceId: purchase.id,
          description: `ទិញវគ្គ: ${episode.titleKh} - ${episode.movie.titleKh}`,
        },
      });

      this.logger.log(`Episode purchase completed: userId=${userId}, episodeId=${dto.episodeId}`);

      return {
        purchase,
        walletBalance: updatedWallet.balance,
      };
    });
  }

  async getUserPurchases(userId: string, page = 1, limit = 20) {
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
                select: { id: true, titleKh: true, posterUrl: true },
              },
              episode: {
                select: { id: true, episodeNumber: true, titleKh: true },
              },
            },
          },
        },
      }),
      this.prisma.purchase.count({ where: { userId } }),
    ]);

    return {
      items: purchases,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async validateAndGetCoupon(tx: object, code: string, userId: string, price: Decimal) {
    const coupon = await (tx as PrismaService).coupon.findFirst({
      where: {
        code,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    });

    if (!coupon) return null;

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return null;

    // Check if user already used this coupon
    const alreadyUsed = await (tx as PrismaService).couponUsage.findFirst({
      where: { couponId: coupon.id, userId },
    });

    if (alreadyUsed) return null;

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && price.lessThan(coupon.minPurchaseAmount)) return null;

    return coupon;
  }

  private applyDiscount(price: Decimal, coupon: { discountType: DiscountType; discountValue: Decimal; maxDiscount: Decimal | null }): Decimal {
    let discount: Decimal;

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = price.times(coupon.discountValue).dividedBy(100);
      if (coupon.maxDiscount && discount.greaterThan(coupon.maxDiscount)) {
        discount = new Decimal(coupon.maxDiscount);
      }
    } else {
      discount = new Decimal(coupon.discountValue);
    }

    const final = price.minus(discount);
    return final.lessThan(0) ? new Decimal(0) : final;
  }
}
