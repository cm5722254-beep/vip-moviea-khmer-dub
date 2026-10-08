import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  IsArray,
  IsNumber,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionType, DiscountType } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  nameKh: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  nameKh?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePromotionDto {
  @IsString()
  nameKh: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsEnum(PromotionType)
  type: PromotionType;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @IsPositive()
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minPurchaseAmount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @IsPositive()
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minPurchaseAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateSettingDto {
  @IsArray()
  settings: Array<{ key: string; value: string }>;
}
