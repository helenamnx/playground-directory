import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  ttl_in_minutes: process.env.TTL_IN_MINUTES || 60,
}));
