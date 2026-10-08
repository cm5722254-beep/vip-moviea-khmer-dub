import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BuyMovieDto {
  @IsUUID()
  @IsNotEmpty()
  movieId: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class BuyEpisodeDto {
  @IsUUID()
  @IsNotEmpty()
  episodeId: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
