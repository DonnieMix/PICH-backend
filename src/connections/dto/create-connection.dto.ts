import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateConnectionDto {
  @IsString()
  @IsNotEmpty()
  scannedUserId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
