import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async createLog(
    adminId: string,
    action: string,
    entity: string,
    entityId: string,
    oldData?: object | null,
    newData?: object | null,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      const log = await this.prisma.auditLog.create({
        data: {
          adminId,
          action,
          entity,
          entityId,
          oldData: oldData ? (oldData as Prisma.InputJsonValue) : Prisma.DbNull,
          newData: newData ? (newData as Prisma.InputJsonValue) : Prisma.DbNull,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      this.logger.log(
        `Audit: admin=${adminId} action=${action} entity=${entity} id=${entityId}`,
      );

      return log;
    } catch (error) {
      // Audit logging failure should never crash the main operation
      this.logger.error('Failed to write audit log', error);
    }
  }

  async getLogs(filters: {
    adminId?: string;
    action?: string;
    entity?: string;
    entityId?: string;
    page?: number;
    limit?: number;
  }) {
    const { adminId, action, entity, entityId, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      ...(adminId && { adminId }),
      ...(action && { action: { contains: action, mode: Prisma.QueryMode.insensitive } }),
      ...(entity && { entity }),
      ...(entityId && { entityId }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { id: true, username: true, role: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
