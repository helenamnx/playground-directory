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
    DATABASE_URI: required(),
    DATABASE_USER: required(),
    DATABASE_PASSWORD: required(),
    DATABASE_NAME: required(),
    REDIS_SOCKET_HOST: required(),
    REDIS_EXTERNAL_PORT: required(),
    REDIS_INTERNAL_PORT: required(),
    TTL_IN_MINUTES: required(),
    NODE_TLS_REJECT_UNAUTHORIZED: required(),
    REALM: required(),
    AUTH_BASE_URL: required(),
    CRYPTO_SECRET_KEY: required(),
    MAX_REDIRECTS: required(),
    TIMEOUT: required(),
    TAG: required(),
    APP_VERSION: required(),
    SEND_EMAILS_LIMIT: required(),
    ASSETS_ROOT_PATH: required(),
    ASSETS_PREFIX: required(),
    TEMPORAL_ASSETS_ROOT_PATH: required(),
    TEMPORAL_ASSETS_PREFIX: required(),
    OWN_PLATFORM_BASE_URL: required(),
    OWN_PLATFORM_ALIAS: required(),
    OWN_PLATFORM_CLIENT_ID: required(),
    OWN_PLATFORM_CLIENT_SECRET: required(),
    OWN_PLATFORM_KEYCLOAK_ID: required(),
    FRONTEND_CLIENT_BASE_URL: required(),
    FRONTEND_CLIENT_EMAIL: required(),
    FRONTEND_CLIENT_FORGOT_URL: required(),
    FRONTEND_CLIENT_ID: required(),
    FRONTEND_CLIENT_SECRET: required(),
    FRONTEND_CLIENT_KEYCLOAK_ID: required(),
    MIGRATION_FILE_PATH: required(),
    // End of the validationSchema
  });
