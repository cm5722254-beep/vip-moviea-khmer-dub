import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { AdminLoginDto } from './dto/admin-auth.dto';
import { Admin } from '@prisma/client';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  logout() {
    // JWT is stateless — client should discard token
    return { message: 'Admin logout ជោគជ័យ' };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  getMe(@CurrentAdmin() admin: Admin) {
    return this.adminAuthService.getMe(admin.id);
  }
}
