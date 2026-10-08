import { IsString, IsNotEmpty } from 'class-validator';

export class TelegramAuthDto {
  @IsString()
  @IsNotEmpty()
  initData: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

export interface JwtPayload {
  sub: string;
  telegramId: string;
  iat?: number;
  exp?: number;
}

export interface AdminJwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}
