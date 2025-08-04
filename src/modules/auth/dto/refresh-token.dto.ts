import { IsString } from 'class-validator';

export class RefresTokenDTO {
  @IsString()
  refreshToken: string;
}
