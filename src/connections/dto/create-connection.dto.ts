import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateConnectionDto {
  @IsString()
  @IsNotEmpty()
  scannedCardId: string;
}
