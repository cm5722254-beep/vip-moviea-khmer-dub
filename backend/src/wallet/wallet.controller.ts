import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TelegramGuard } from '../auth/telegram.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateDepositDto, TransactionHistoryDto } from './wallet.dto';
import { User } from '@prisma/client';

@Controller('wallet')
@UseGuards(TelegramGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: User) {
    return this.walletService.getWallet(user.id);
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: User, @Query() query: TransactionHistoryDto) {
    return this.walletService.getTransactions(user.id, query);
  }

  @Post('deposit')
  createDeposit(@CurrentUser() user: User, @Body() dto: CreateDepositDto) {
    return this.walletService.createDepositRequest(user.id, dto);
  }

  @Get('deposits')
  getDepositHistory(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getDepositHistory(user.id, page, limit);
  }
}
