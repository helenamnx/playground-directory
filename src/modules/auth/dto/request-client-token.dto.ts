import { IsNotEmpty, IsString } from 'class-validator';

export class RequestClientTokenDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  clientSecret: string;
}
