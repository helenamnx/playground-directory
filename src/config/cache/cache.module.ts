import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from './cache-config.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
      // useFactory:
      //  async () => {
      //   const store = await redisStore({
      //     socket: {
      //       host: 'localhost',
      //       port: 6380,
      //     },
      //   });
      //   return {
      //     store: () => store,
      //   };
      // },
    }),
  ],
})
export class CacheConfigModule {}
