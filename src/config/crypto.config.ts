import { registerAs } from '@nestjs/config';

export default registerAs('crypto', () => ({
  CRYPTO_SECRET_KEY: process.env.CRYPTO_SECRET_KEY,
}));
