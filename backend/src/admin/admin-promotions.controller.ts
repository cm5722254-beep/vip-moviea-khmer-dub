import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminPromotionsService } from './admin-promotions.service';
import { AdminGuard } from '../auth/admin.guard';
import { CreatePromotionDto, CreateCouponDto } from './dto/admin-misc.dto';

@Controller('admin/promotions')
@UseGuards(AdminGuard)
export class AdminPromotionsController {
  constructor(private readonly adminPromotionsService: AdminPromotionsService) {}

  // Promotions
  @Get()
  findAllPromotions(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminPromotionsService.findAllPromotions(page, limit);
  }

  @Post()
  createPromotion(@Body() dto: CreatePromotionDto) {
    return this.adminPromotionsService.createPromotion(dto);
  }

  @Patch(':id')
  updatePromotion(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreatePromotionDto>) {
    return this.adminPromotionsService.updatePromotion(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePromotion(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminPromotionsService.deletePromotion(id);
    return { message: 'Promotion បានលុបជោគជ័យ' };
  }

  // Coupons
  @Get('coupons')
  findAllCoupons(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminPromotionsService.findAllCoupons(page, limit);
  }

  @Post('coupons')
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.adminPromotionsService.createCoupon(dto);
  }

  @Patch('coupons/:id')
  updateCoupon(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCouponDto>,
  ) {
    return this.adminPromotionsService.updateCoupon(id, dto);
  }

  @Delete('coupons/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCoupon(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminPromotionsService.deleteCoupon(id);
    return { message: 'Coupon បានលុបជោគជ័យ' };
  }

  @Patch('coupons/:id/toggle')
  toggleCouponStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminPromotionsService.toggleCouponStatus(id);
  }
}
