import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
}));
