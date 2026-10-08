import { IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsString()
  preferences?: string;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class WatchHistoryQueryDto extends PaginationDto {}

export class PurchaseHistoryQueryDto extends PaginationDto {}
