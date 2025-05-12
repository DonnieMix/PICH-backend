import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateConnectionDto {
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
