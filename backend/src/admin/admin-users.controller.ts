import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { UsersFilterDto, UpdateUserStatusDto, CreditDebitDto } from './dto/admin-users.dto';
import { Admin } from '@prisma/client';

@Controller('admin/users')
@UseGuards(AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll(@Query() query: UsersFilterDto) {
    return this.adminUsersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminUsersService.updateStatus(id, dto, admin.id);
  }

  @Post(':id/credit')
  creditBalance(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreditDebitDto,
  ) {
    return this.adminUsersService.creditBalance(id, dto, admin.id);
  }

  @Post(':id/debit')
  debitBalance(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreditDebitDto,
  ) {
    return this.adminUsersService.debitBalance(id, dto, admin.id);
  }
}
