import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramAuthDto, TelegramUser, JwtPayload } from './auth.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  validateTelegramWebAppData(initData: string): TelegramUser {
    if (!initData) {
      throw new UnauthorizedException('ទិន្នន័យ Telegram ខ្វះ');
    }

    // ── DEV MODE BYPASS ────────────────────────────────────────────────────
    // When NODE_ENV=development, accept a special mock token so the app can
    // be tested locally without a real Telegram session.
    // NEVER allow this in production.
    if (process.env.NODE_ENV === 'development' && initData === 'mock_dev_data') {
      this.logger.warn('⚠️  DEV MODE: Using mock Telegram user — never allow in production!');
      return {
        id: 999999999,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        language_code: 'km',
        is_premium: false,
      };
    }
    // ── END DEV BYPASS ─────────────────────────────────────────────────────

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      throw new UnauthorizedException('ហ្សែន hash ខ្វះក្នុងទិន្នន័យ Telegram');
    }

    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN មិនបានកំណត់');
    }

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (expectedHash !== hash) {
      this.logger.warn('Invalid Telegram HMAC signature detected');
      throw new UnauthorizedException('ទិន្នន័យ Telegram មិនត្រឹមត្រូវ');
    }

    // Validate auth_date to prevent replay attacks (max 1 hour old)
    const authDateStr = urlParams.get('auth_date');
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10);
      const now = Math.floor(Date.now() / 1000);
      const maxAge = parseInt(process.env.TELEGRAM_AUTH_MAX_AGE || '3600', 10);
      if (now - authDate > maxAge) {
        throw new UnauthorizedException('ទិន្នន័យ Telegram ផុតកំណត់ហើយ');
      }
    }

    const userStr = urlParams.get('user');
    if (!userStr) {
      throw new UnauthorizedException('ព័ត៌មានអ្នកប្រើប្រាស់ខ្វះ');
    }

    let telegramUser: TelegramUser;
    try {
      telegramUser = JSON.parse(userStr) as TelegramUser;
    } catch {
      throw new UnauthorizedException('ទិន្នន័យអ្នកប្រើប្រាស់ Telegram មិនត្រឹមត្រូវ');
    }

    if (!telegramUser.id || !telegramUser.first_name) {
      throw new UnauthorizedException('ព័ត៌មាន Telegram មិនគ្រប់គ្រាន់');
    }

    return telegramUser;
  }

  async authenticateTelegram(dto: TelegramAuthDto): Promise<{ token: string; user: object }> {
    // Always validate from initData — NEVER trust a frontend-provided telegramId
    const telegramUser = this.validateTelegramWebAppData(dto.initData);

    const telegramId = String(telegramUser.id);

    // Upsert user in DB
    const user = await this.prisma.user.upsert({
      where: { telegramId },
      create: {
        telegramId,
        username: telegramUser.username || null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || null,
        languageCode: telegramUser.language_code || 'km',
        photoUrl: telegramUser.photo_url || null,
        isPremium: telegramUser.is_premium || false,
        status: UserStatus.ACTIVE,
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
      update: {
        username: telegramUser.username || null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || null,
        photoUrl: telegramUser.photo_url || null,
        isPremium: telegramUser.is_premium || false,
        lastActiveAt: new Date(),
      },
      include: {
        wallet: true,
      },
    });

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('គណនីរបស់អ្នកត្រូវបានហាម');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('គណនីរបស់អ្នកត្រូវបានផ្អាក');
    }

    const payload: JwtPayload = {
      sub: user.id,
      telegramId: user.telegramId,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`User authenticated: telegramId=${telegramId}`);

    return {
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        isPremium: user.isPremium,
        languageCode: user.languageCode,
        walletBalance: user.wallet?.balance ?? 0,
      },
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token មិនត្រឹមត្រូវ ឬផុតកំណត់');
    }
  }
}
