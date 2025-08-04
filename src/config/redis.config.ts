import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  externalPort: process.env.REDIS_EXTERNAL_PORT,
  internalPort: process.env.REDIS_INTERNAL_PORT,
  host: process.env.REDIS_SOCKET_HOST,
}));
