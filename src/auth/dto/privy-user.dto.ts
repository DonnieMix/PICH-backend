import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class PrivyUserDto {
  @IsString()
  @IsNotEmpty()
  privyId: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  walletAddress?: string | null;
}
