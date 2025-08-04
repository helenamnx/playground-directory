import { IsNotEmpty, IsString } from 'class-validator';

export class VerifySessionDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;
}
