import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersFilterDto, UpdateUserStatusDto, CreditDebitDto } from './dto/admin-users.dto';
import { Prisma, TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: UsersFilterDto) {
    const { page = 1, limit = 20, q, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(status && { status }),
      ...(q && {
        OR: [
          { username: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { firstName: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { telegramId: { contains: q } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          lastName: true,
          status: true,
          isPremium: true,
          createdAt: true,
          lastActiveAt: true,
          wallet: { select: { balance: true } },
          _count: { select: { purchases: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            transactions: {
              take: 10,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        _count: {
          select: { purchases: true, favorites: true, watchHistory: true },
        },
      },
    });

    if (!user) throw new NotFoundException('រកមិនឃើញអ្នកប្រើប្រាស់');
    return user;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto, adminId: string) {
    const user = await this.findOne(id);
    const oldStatus = user.status;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.auditService.createLog(
      adminId,
      'UPDATE_STATUS',
      'User',
      id,
      { status: oldStatus },
      { status: dto.status, reason: dto.reason },
    );

    this.logger.log(`User status updated: ${id} ${oldStatus} → ${dto.status}`);
    return updated;
  }

  async creditBalance(id: string, dto: CreditDebitDto, adminId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUnique({
        where: { id },
        include: { wallet: true },
      });

      if (!user) throw new NotFoundException('រកមិនឃើញអ្នកប្រើប្រាស់');
      if (!user.wallet) throw new BadRequestException('Wallet រកមិនឃើញ');

      const amount = new Decimal(dto.amount);
      const balanceBefore = new Decimal(user.wallet.balance);
      const balanceAfter = balanceBefore.plus(amount);

      const updatedWallet = await tx.wallet.update({
        where: { id: user.wallet.id },
        data: {
          balance: { increment: amount },
          totalDeposited: { increment: amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet.id,
          type: TransactionType.ADMIN_CREDIT,
          amount,
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          description: `Admin credit: ${dto.reason}`,
          referenceId: adminId,
        },
      });

      await this.auditService.createLog(
        adminId,
        'CREDIT_WALLET',
        'User',
        id,
        { balance: balanceBefore },
        { balance: balanceAfter, amount: dto.amount, reason: dto.reason },
      );

      return { walletBalance: updatedWallet.balance };
    });
  }

  async debitBalance(id: string, dto: CreditDebitDto, adminId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUnique({
        where: { id },
        include: { wallet: true },
      });

      if (!user) throw new NotFoundException('រកមិនឃើញអ្នកប្រើប្រាស់');
      if (!user.wallet) throw new BadRequestException('Wallet រកមិនឃើញ');

      const amount = new Decimal(dto.amount);
      const balanceBefore = new Decimal(user.wallet.balance);

      if (balanceBefore.lessThan(amount)) {
        throw new BadRequestException('សាច់ប្រាក់ Wallet មិនគ្រប់គ្រាន់');
      }

      const balanceAfter = balanceBefore.minus(amount);

      const updatedWallet = await tx.wallet.update({
        where: { id: user.wallet.id },
        data: {
          balance: { decrement: amount },
          totalSpent: { increment: amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet.id,
          type: TransactionType.ADMIN_DEBIT,
          amount: amount.negated(),
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          description: `Admin debit: ${dto.reason}`,
          referenceId: adminId,
        },
      });

      await this.auditService.createLog(
        adminId,
        'DEBIT_WALLET',
        'User',
        id,
        { balance: balanceBefore },
        { balance: balanceAfter, amount: dto.amount, reason: dto.reason },
      );

      return { walletBalance: updatedWallet.balance };
    });
  }
}
