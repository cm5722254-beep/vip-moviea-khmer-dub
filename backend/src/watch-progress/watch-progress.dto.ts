import { IsUUID, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveProgressDto {
  @IsUUID()
  @IsNotEmpty()
  movieId: string;

  @IsUUID()
  @IsNotEmpty()
  episodeId: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  progressSeconds: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  durationSeconds: number;
}
