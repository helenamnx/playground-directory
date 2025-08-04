import { registerAs } from '@nestjs/config';

export default registerAs('images', () => ({
  ASSETS_ROOT_PATH: process.env.ASSETS_ROOT_PATH,
  ASSETS_PREFIX: process.env.ASSETS_PREFIX,
  TEMPORAL_ASSETS_ROOT_PATH: process.env.TEMPORAL_ASSETS_ROOT_PATH,
  TEMPORAL_ASSETS_PREFIX: process.env.TEMPORAL_ASSETS_PREFIX,
}));
