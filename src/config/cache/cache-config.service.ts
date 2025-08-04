import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheOptionsFactory, CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import RedisMock from 'ioredis-mock';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  private redisSocket: any;
  private nodeEnv: string;

  constructor(private readonly configService: ConfigService) {
    this.redisSocket = this.configService.get<string>('redis');
    this.nodeEnv = this.configService.get<string>('app.nodeEnv');
  }

  async createCacheOptions(): Promise<CacheModuleOptions | any> {
    if (this.nodeEnv === 'test') {
      return {
        store: new RedisMock(),
      };
    }
    const { host, internalPort, externalPort } = this.redisSocket;
    const cacheOptions = {
      store: await redisStore({
        socket: {
          host: host,
          port: host === 'localhost' ? externalPort : internalPort,
        },
      }),
    };

    return cacheOptions;
  }
}
