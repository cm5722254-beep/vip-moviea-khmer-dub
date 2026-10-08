import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminDepositsService } from './admin-deposits.service';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { DepositsFilterDto, ApproveDepositDto, RejectDepositDto } from './dto/admin-users.dto';
import { Admin } from '@prisma/client';

@Controller('admin/deposits')
@UseGuards(AdminGuard)
export class AdminDepositsController {
  constructor(private readonly adminDepositsService: AdminDepositsService) {}

  @Get()
  findAll(@Query() query: DepositsFilterDto) {
    return this.adminDepositsService.findAll(query);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveDepositDto,
  ) {
    return this.adminDepositsService.approve(id, dto, admin.id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @CurrentAdmin() admin: Admin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectDepositDto,
  ) {
    return this.adminDepositsService.reject(id, dto, admin.id);
  }
}
