import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto, CreateCouponDto } from './dto/admin-misc.dto';

@Injectable()
export class AdminPromotionsService {
  constructor(private prisma: PrismaService) {}

  // Promotions
  async findAllPromotions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.promotion.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promotion.count(),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createPromotion(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: {
        nameKh: dto.nameKh,
        nameEn: dto.nameEn,
        type: dto.type,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxDiscount: dto.maxDiscount,
        minPurchaseAmount: dto.minPurchaseAmount,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
        isActive: true,
      },
    });
  }

  async updatePromotion(id: string, dto: Partial<CreatePromotionDto>) {
    const promo = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion រកមិនឃើញ');

    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...(dto.nameKh && { nameKh: dto.nameKh }),
        ...(dto.nameEn !== undefined && { nameEn: dto.nameEn }),
        ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  async deletePromotion(id: string) {
    const promo = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion រកមិនឃើញ');
    return this.prisma.promotion.delete({ where: { id } });
  }

  // Coupons
  async findAllCoupons(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { usages: true } },
        },
      }),
      this.prisma.coupon.count(),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createCoupon(dto: CreateCouponDto) {
    const exists = await this.prisma.coupon.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException('Coupon code នេះមានរួចហើយ');

    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxDiscount: dto.maxDiscount,
        minPurchaseAmount: dto.minPurchaseAmount,
        maxUses: dto.maxUses,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: true,
      },
    });
  }

  async updateCoupon(id: string, dto: Partial<CreateCouponDto>) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon រកមិនឃើញ');

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
        ...(dto.maxUses !== undefined && { maxUses: dto.maxUses }),
        ...(dto.expiresAt && { expiresAt: new Date(dto.expiresAt) }),
      },
    });
  }

  async deleteCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon រកមិនឃើញ');
    return this.prisma.coupon.delete({ where: { id } });
  }

  async toggleCouponStatus(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon រកមិនឃើញ');
    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
  }
}
