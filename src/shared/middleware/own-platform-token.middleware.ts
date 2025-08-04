import { Injectable, NestMiddleware } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/modules/auth/auth.service';
import { RedisService } from '../services/redis/redis.service';
import { secondsToMinutes } from '../utils/utils';
import { NextFunction, Response } from 'express';

@Injectable()
export class OwnPlatformTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}
  async use(req: any, res: Response, next: NextFunction) {
    try {
      const storedToken = await this.redisService.get('own-platform-token');

      if (storedToken) {
        return next();
      }
      const clientID = this.configService.get<string>('auth.CLIENT_ID');
      const clientSecret = this.configService.get<string>('auth.CLIENT_SECRET');
      const newToken = await this.authService.requestClientToken({
        clientId: clientID,
        clientSecret: clientSecret,
      });
      await this.redisService.set({
        key: 'own-platform-token',
        value: newToken,
        minutes: secondsToMinutes(newToken.expires_in),
      });
      return next();
    } catch (error) {
      return next(error);
    }
  }
}
