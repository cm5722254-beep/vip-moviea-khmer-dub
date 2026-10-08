import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TelegramGuard } from './telegram.guard';
import { AdminGuard } from './admin.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TelegramGuard, AdminGuard],
  exports: [AuthService, TelegramGuard, AdminGuard],
})
export class AuthModule {}
