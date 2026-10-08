import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './auth.dto';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @UseGuards(new RateLimitGuard(20, 60000)) // 20 auth attempts per minute
  async telegramAuth(@Body() dto: TelegramAuthDto) {
    return this.authService.authenticateTelegram(dto);
  }
}
