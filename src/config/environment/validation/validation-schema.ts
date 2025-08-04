import { ConfigModuleOptions } from '@nestjs/config';
import Joi from 'joi';
const required = () => {
  return Joi.string().required();
};
export const validationSchema: ConfigModuleOptions['validationSchema'] =
  Joi.object({
    PORT: required(),
    CORS_ORIGIN: required(),
    NODE_ENV: required(),
    DATABASE_EXTERNAL_PORT: required(),
    DATABASE_INTERNAL_PORT: required(),
    DATABASE_USER: required(),
    DATABASE_PASSWORD: required(),
    DATABASE_NAME: required(),
    REDIS_SOCKET_HOST: required(),
    REDIS_EXTERNAL_PORT: required(),
    REDIS_INTERNAL_PORT: required(),
    TTL_IN_MINUTES: required(),
    NODE_TLS_REJECT_UNAUTHORIZED: required(),
    AUTH_BASE_URL: required(),
    CLIENT_ID: required(),
    CLIENT_SECRET: required(),
    REALM: required(),
    CRYPTO_SECRET_KEY: required(),
    TIMEOUT: required(),
    MAX_REDIRECTS: required(),
    SEND_EMAILS_LIMIT: required(),
    TAG: required(),
    APP_VERSION: required(),
    ASSETS_ROOT_PATH: required(),
    ASSETS_PREFIX: required(),
    TEMPORAL_ASSETS_ROOT_PATH: required(),
    TEMPORAL_ASSETS_PREFIX: required(),
    PLATFORM_BASE_URL: required(),
    OWN_PLATFORM_ALIAS: required(),
    // End of the validationSchema
  });
