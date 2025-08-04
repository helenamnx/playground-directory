import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/shared/services/redis/redis.service';

@Injectable()
export class IdempotencyKeysService {
  private readonly ttlInMinutes: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.ttlInMinutes = this.configService.get<number>(
      'cache.ttl_in_minutes',
      60,
    );
  }
  private readonly IN_PROGRESS_MARKER = 'IN_PROGRESS';
  async find(key: string) {
    const data = await this.redis.get(key);
    if (data) {
      return { key, response: data === this.IN_PROGRESS_MARKER ? null : data };
    }
  }

  async preSave(key: string): Promise<void> {
    await this.redis.set({
      key: key,
      value: this.IN_PROGRESS_MARKER,
      minutes: this.ttlInMinutes,
    });
  }

  async update(key: string, response: any): Promise<void> {
    await this.redis.set({
      key: key,
      value: response,
      minutes: this.ttlInMinutes,
    });
  }
}
