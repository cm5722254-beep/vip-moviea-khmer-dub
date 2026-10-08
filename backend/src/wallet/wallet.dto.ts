import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsInt,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepositDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @IsUUID()
  paymentMethodId: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class TransactionHistoryDto {
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

  @IsOptional()
  @IsString()
  type?: string;
}
