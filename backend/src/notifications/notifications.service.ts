import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly telegramApiBase = 'https://api.telegram.org';

  constructor(private prisma: PrismaService) {}

  async sendTelegramMessage(telegramId: string, message: string): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set, cannot send message');
      return false;
    }

    try {
      const response = await fetch(
        `${this.telegramApiBase}/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramId,
            text: message,
            parse_mode: 'HTML',
          }),
        },
      );

      const result = await response.json() as { ok: boolean; description?: string };

      if (!result.ok) {
        this.logger.warn(`Telegram message failed: ${result.description}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to send Telegram message', error);
      return false;
    }
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    titleKh: string,
    bodyKh: string,
    data?: object,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        titleKh,
        bodyKh,
        data: data ? (data as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });

    // Also try to send via Telegram bot
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    });

    if (user) {
      const message = `<b>${titleKh}</b>\n\n${bodyKh}`;
      await this.sendTelegramMessage(user.telegramId, message);
    }

    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      items: notifications,
      unreadCount,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async notifyDepositApproved(userId: string, amount: number) {
    return this.createNotification(
      userId,
      NotificationType.DEPOSIT_APPROVED,
      'ការដាក់ប្រាក់ត្រូវបានអនុម័ត',
      `ការដាក់ប្រាក់ចំនួន $${amount} របស់អ្នកត្រូវបានបញ្ជាក់ ហើយបានបន្ថែមទៅ Wallet របស់អ្នករួចហើយ។`,
      { amount },
    );
  }

  async notifyDepositRejected(userId: string, amount: number, reason?: string) {
    return this.createNotification(
      userId,
      NotificationType.DEPOSIT_REJECTED,
      'ការដាក់ប្រាក់ត្រូវបានបដិសេធ',
      `ការដាក់ប្រាក់ចំនួន $${amount} របស់អ្នកត្រូវបានបដិសេធ។${reason ? ` មូលហេតុ: ${reason}` : ''}`,
      { amount, reason },
    );
  }

  async notifyPurchaseSuccess(userId: string, movieTitle: string) {
    return this.createNotification(
      userId,
      NotificationType.PURCHASE_SUCCESS,
      'ការទិញបានជោគជ័យ',
      `អ្នកបានទិញ "${movieTitle}" ដោយជោគជ័យ។ អ្នកអាចរីករាយទស្សនាបានឥឡូវ!`,
      { movieTitle },
    );
  }
}
