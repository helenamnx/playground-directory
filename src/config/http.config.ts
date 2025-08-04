import { registerAs } from '@nestjs/config';

export default registerAs('http', () => ({
  TIMEOUT: process.env.TIMEOUT,
  MAX_REDIRECTS: process.env.MAX_REDIRECTS,
  // EXTERNAL_SERVICE_URL_BASE: process.env.KEYCLOAK_URL_BASE,
  // EXTERNAL_SERVICE_ALIAS: process.env.SERVICE_ALIAS,
}));
