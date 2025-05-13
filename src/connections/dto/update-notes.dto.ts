import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNotesDto {
  @IsString()
  @IsNotEmpty()
  notes: string;
}
