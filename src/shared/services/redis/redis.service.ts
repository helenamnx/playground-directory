import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Global, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { minutesToMiliseconds } from 'src/shared/utils/utils';

@Global()
@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string) {
    return await this.cacheManager.get(key);
  }
  async del(key: string) {
    return await this.cacheManager.del(key);
  }

  async set(params: { key: string; value: any; minutes: number }) {
    const { key, value, minutes } = params;
    if (minutes < 0) {
      return this.cacheManager.set(key, value);
    }
    const ttl = minutesToMiliseconds(minutes);
    await this.cacheManager.set(key, value, ttl);
  }
}
