import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.DATABASE_URI || '',
  dbName: process.env.DATABASE_NAME || '',
  user: process.env.DATABASE_USER || '',
  pass: process.env.DATABASE_PASSWORD || '',
}));
