import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus, DepositStatus } from '@prisma/client';

export class UsersFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreditDebitDto {
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsString()
  reason: string;
}

export class DepositsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(DepositStatus)
  status?: DepositStatus;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class ApproveDepositDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class RejectDepositDto {
  @IsString()
  reason: string;
}
