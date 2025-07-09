import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class LoginWithPrivyDto {

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  privyAccessToken: string;
}
