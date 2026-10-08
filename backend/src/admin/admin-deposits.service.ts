import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { DepositsFilterDto, ApproveDepositDto, RejectDepositDto } from './dto/admin-users.dto';
import {
  Prisma,
  DepositStatus,
  TransactionType,
  TransactionStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AdminDepositsService {
  private readonly logger = new Logger(AdminDepositsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  async findAll(query: DepositsFilterDto) {
    const { page = 1, limit = 20, status, userId } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(userId && { userId }),
    };

    const [deposits, total] = await Promise.all([
      this.prisma.deposit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, firstName: true, telegramId: true } },
          paymentMethod: { select: { nameKh: true, nameEn: true } },
        },
      }),
      this.prisma.deposit.count({ where }),
    ]);

    return {
      items: deposits,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approve(depositId: string, dto: ApproveDepositDto, adminId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const deposit = await tx.deposit.findUnique({
        where: { id: depositId },
        include: { user: true },
      });

      if (!deposit) throw new NotFoundException('រកមិនឃើញការដាក់ប្រាក់');
      if (deposit.status !== DepositStatus.PENDING) {
        throw new ConflictException('ការដាក់ប្រាក់នេះបានដំណើរការរួចហើយ');
      }

      const wallet = await tx.wallet.findUnique({ where: { userId: deposit.userId } });
      if (!wallet) throw new BadRequestException('Wallet រកមិនឃើញ');

      const amount = new Decimal(deposit.amount);
      const balanceBefore = new Decimal(wallet.balance);
      const balanceAfter = balanceBefore.plus(amount);

      // 1. Credit wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
          totalDeposited: { increment: amount },
        },
      });

      // 2. Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.DEPOSIT,
          amount,
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          referenceId: depositId,
          description: `ការដាក់ប្រាក់ ${deposit.reference} ត្រូវបានអនុម័ត`,
        },
      });

      // 3. Update deposit status
      const updated = await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: DepositStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: adminId,
          adminNote: dto.note,
        },
      });

      await this.auditService.createLog(
        adminId,
        'APPROVE_DEPOSIT',
        'Deposit',
        depositId,
        { status: DepositStatus.PENDING },
        { status: DepositStatus.APPROVED, amount: deposit.amount },
      );

      // 4. Send notification (non-blocking)
      this.notificationsService
        .notifyDepositApproved(deposit.userId, Number(deposit.amount))
        .catch((err: unknown) => this.logger.error('Failed to send deposit notification', err));

      this.logger.log(`Deposit approved: ${depositId}, amount=${deposit.amount}`);

      return updated;
    });
  }

  async reject(depositId: string, dto: RejectDepositDto, adminId: string) {
    const deposit = await this.prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit) throw new NotFoundException('រកមិនឃើញការដាក់ប្រាក់');
    if (deposit.status !== DepositStatus.PENDING) {
      throw new ConflictException('ការដាក់ប្រាក់នេះបានដំណើរការរួចហើយ');
    }

    const updated = await this.prisma.deposit.update({
      where: { id: depositId },
      data: {
        status: DepositStatus.REJECTED,
        rejectedAt: new Date(),
        rejectedBy: adminId,
        rejectionReason: dto.reason,
      },
    });

    await this.auditService.createLog(
      adminId,
      'REJECT_DEPOSIT',
      'Deposit',
      depositId,
      { status: DepositStatus.PENDING },
      { status: DepositStatus.REJECTED, reason: dto.reason },
    );

    this.notificationsService
      .notifyDepositRejected(deposit.userId, Number(deposit.amount), dto.reason)
      .catch((err: unknown) => this.logger.error('Failed to send rejection notification', err));

    return updated;
  }
}
