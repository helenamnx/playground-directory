import { Module } from '@nestjs/common';

import { IdempotencyKeysService } from './idempotency-keys.service';
import { RedisService } from 'src/shared/services/redis/redis.service';

@Module({
  providers: [IdempotencyKeysService, RedisService],
})
export class IdempotencyKeysModule {}
