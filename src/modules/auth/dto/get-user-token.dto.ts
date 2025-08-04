import { IsString } from 'class-validator';

export class GetAuthTokenDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
