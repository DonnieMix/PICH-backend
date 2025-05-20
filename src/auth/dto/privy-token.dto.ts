import { IsNotEmpty, IsString } from 'class-validator';

export class PrivyTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
