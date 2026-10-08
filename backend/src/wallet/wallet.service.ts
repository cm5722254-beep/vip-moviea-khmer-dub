import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepositDto, TransactionHistoryDto } from './wallet.dto';
import { DepositStatus, TransactionType } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        balance: true,
        frozenBalance: true,
        totalDeposited: true,
        totalSpent: true,
        updatedAt: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException('រកមិនឃើញ Wallet');
    }

    return wallet;
  }

  async getTransactions(userId: string, query: TransactionHistoryDto) {
    const { page = 1, limit = 20, type } = query;
    const skip = (page - 1) * limit;

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('រកមិនឃើញ Wallet');

    const where = {
      walletId: wallet.id,
      ...(type && { type: type as TransactionType }),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      items: transactions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createDepositRequest(userId: string, dto: CreateDepositDto) {
    // Verify payment method exists and is active
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: dto.paymentMethodId, isActive: true },
    });

    if (!paymentMethod) {
      throw new NotFoundException('រកមិនឃើញ Payment Method');
    }

    // Validate deposit limits
    const minDeposit = Number(
      (await this.prisma.setting.findUnique({ where: { key: 'min_deposit_amount' } }))?.value || 1,
    );
    const maxDeposit = Number(
      (await this.prisma.setting.findUnique({ where: { key: 'max_deposit_amount' } }))?.value || 10000,
    );

    if (dto.amount < minDeposit) {
      throw new BadRequestException(`ចំនួនទឹកប្រាក់អប្បបរមាគឺ ${minDeposit}`);
    }

    if (dto.amount > maxDeposit) {
      throw new BadRequestException(`ចំនួនទឹកប្រាក់អតិបរមាគឺ ${maxDeposit}`);
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('រកមិនឃើញ Wallet');

    // Generate reference number
    const reference = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        walletId: wallet.id,
        paymentMethodId: dto.paymentMethodId,
        amount: dto.amount,
        reference,
        status: DepositStatus.PENDING,
        note: dto.note,
        metadata: {
          userAgent: 'telegram-mini-app',
          requestedAt: new Date().toISOString(),
        },
      },
      include: {
        paymentMethod: {
          select: { nameKh: true, nameEn: true, accountInfo: true, qrCodeUrl: true },
        },
      },
    });

    return deposit;
  }

  async getDepositHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [deposits, total] = await Promise.all([
      this.prisma.deposit.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          paymentMethod: {
            select: { nameKh: true, nameEn: true },
          },
        },
      }),
      this.prisma.deposit.count({ where: { userId } }),
    ]);

    return {
      items: deposits,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
