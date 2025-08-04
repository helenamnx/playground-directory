import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  AUTH_ADMIN_URL: process.env.AUTH_ADMIN_URL,
  AUTH_BASE_URL: process.env.AUTH_BASE_URL,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  CLIENT_KEYCLOAK_ID: process.env.CLIENT_KEYCLOAK_ID,
  REALM: process.env.REALM,
}));
