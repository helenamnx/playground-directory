import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './app.config';
import { validationOptions } from './environment/validation/validation-options';
import { validationSchema } from './environment/validation/validation-schema';
import DATABASE_CONFIG from './database.config';
import REDIS_CONFIG from './redis.config';
import CACHE_CONFIG from './cache.config';
import CRYPTO from './crypto.config';
import HTTP from './http.config';
import JWT from './jwt.config';
import AUTH from './auth.config';
import IMAGES from './images.config';
import PLATFORM from './platform.config';
const environment = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
      cache: true,
      load: [
        appConfig,
        DATABASE_CONFIG,
        REDIS_CONFIG,
        CACHE_CONFIG,
        CRYPTO,
        HTTP,
        JWT,
        AUTH,
        IMAGES,
        PLATFORM,
      ],
      validationSchema,
      validationOptions,
    }),
  ],
  providers: [ConfigService],
})
export class AppConfigModule {}
