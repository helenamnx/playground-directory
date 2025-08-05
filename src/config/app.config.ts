import { registerAs } from '@nestjs/config';
export default registerAs('app', () => ({
  PORT: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  SEND_EMAILS_LIMIT: process.env.SEND_EMAILS_LIMIT,
  APP_VERSION: process.env.APP_VERSION,
}));

export enum ApiConfigKeysEnum {
  PORT = 'PORT',
  nodeEnv = 'nodeEnv',
  SEND_EMAILS_LIMIT = 'SEND_EMAILS_LIMIT',
  APP_VERSION = 'APP_VERSION',
}
