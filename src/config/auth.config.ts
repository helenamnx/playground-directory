import { ConfigServiceKeys } from '@/shared/enums/config-service-keys.enum';
import { registerAs } from '@nestjs/config';

export default registerAs(
  ConfigServiceKeys.AUTH,
  (): AuthConfig => ({
    AUTH_BASE_URL: process.env.AUTH_BASE_URL,
    REALM: process.env.REALM,
  }),
);

export interface AuthConfig {
  AUTH_BASE_URL: string;
  REALM: string;
}
