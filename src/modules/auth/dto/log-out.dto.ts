// keycloak-logout.dto.ts
import { IsString } from 'class-validator';

export class LogOutDto {
  @IsString()
  refreshToken: string;
}
