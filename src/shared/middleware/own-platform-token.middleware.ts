import { Injectable, NestMiddleware } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/modules/auth/auth.service';
import { RedisService } from '../services/redis/redis.service';
import { secondsToMinutes } from '../utils/utils';
import { NextFunction, Response } from 'express';
import { AuthConfig } from '@/config/auth.config';
import { ConfigServiceKeys } from '../enums/config-service-keys.enum';
import { ServicesService } from '@/modules/services/services.service';
import { PlatformsService } from '@/modules/platforms/platforms.service';
import { RedisKeys } from '../enums/redis-keys.enum';

@Injectable()
export class OwnPlatformTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly platformsService: PlatformsService,
  ) {}

  async use(req: any, res: Response, next: NextFunction) {
    try {
      const storedToken = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      if (storedToken) {
        return next();
      }
      await this.setOwnPlatformToken();
      return next();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @description This function sets the own platform token in redis.
   * @author Damian
   * @date 13/06/2025
   * @memberof OwnPlatformTokenMiddleware
   */
  private async setOwnPlatformToken() {
    const ownPlatform = await this.platformsService.getOwnPlatform();

    const newToken = await this.authService.requestClientToken({
      clientId: ownPlatform.clientId,
      clientSecret: ownPlatform.clientSecret,
    });
    await this.redisService.set({
      key: RedisKeys.OWN_PLATFORM_TOKEN,
      value: newToken,
      minutes: secondsToMinutes(newToken.expires_in),
    });
  }
}
