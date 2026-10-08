import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { TelegramGuard } from '../auth/telegram.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BuyMovieDto, BuyEpisodeDto } from './purchases.dto';
import { User } from '@prisma/client';

@Controller('purchases')
@UseGuards(TelegramGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post('movie')
  buyMovie(@CurrentUser() user: User, @Body() dto: BuyMovieDto) {
    return this.purchasesService.buyMovie(user.id, dto);
  }

  @Post('episode')
  buyEpisode(@CurrentUser() user: User, @Body() dto: BuyEpisodeDto) {
    return this.purchasesService.buyEpisode(user.id, dto);
  }

  @Get()
  getUserPurchases(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.purchasesService.getUserPurchases(user.id, page, limit);
  }
}
