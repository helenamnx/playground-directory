import { Injectable, OnModuleInit } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { FastifyInstance } from 'fastify';
import { CustomErrorKeys } from '../../enums/error-keys.enum';
import { UnauthorizedCustomResponse } from '../../responses/error/custom-error-response';
import { AuthService } from '@/modules/auth/auth.service';
import {
  decodeToken,
  getTokenFromBearer,
  isTokenExpired,
} from '../../utils/token.utils';
import { AsyncStorageService } from '../als/als.service';
import { ConfigService } from '@nestjs/config';
import { EntitiesService } from '../entities/entities.service';
import { HeaderKeysEnum } from '@/shared/enums/headers.enum';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { AppUsersService } from '@/modules/app-users/app-users.service';

@Injectable()
export class UserTokenHookService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly alsService: AsyncStorageService,
    private readonly configService: ConfigService,
    private readonly entitiesService: EntitiesService,
    private readonly appUsersService: AppUsersService,
  ) {}
  async userTokenHook(req: any, reply: FastifyReply) {
    const appVersion = this.configService.get<string>('APP_VERSION');
    const excludedPrefixes = [
      `/${appVersion}/auth/refresh-token`,
      `/${appVersion}/auth/client-token`,
      `/${appVersion}/auth/login`,
      // `/${appVersion}/auth/logout`,
    ]; //TODO: ver manera para evitar usar excluedRoutes

    //check if the request URL starts with the specified excluded prefixes
    const isExcluded = excludedPrefixes.some((prefix) =>
      req.originalUrl.startsWith(prefix),
    );

    //if the request URL matches any excluded routes, return
    if (
      isExcluded ||
      req.originalUrl === `/${appVersion}` ||
      req.originalUrl === `/`
    ) {
      return;
    }

    const userToken = req.headers[HeaderKeysEnum.AUTHORIZATION.toLowerCase()];
    if (!userToken) {
      // throw new UnauthorizedCustomResponse({
      //   title: 'Missing user token',
      //   key: CustomErrorKeys.MISSING_USER_TOKEN,
      //   detail: 'Missing user token',
      // });

      return;
    }

    const decryptedUserToken = decodeToken(userToken as string);
    const userAccessToken = getTokenFromBearer(userToken);
    const validToken = await this.authService.verifyTokenSession({
      access_token: userAccessToken,
    });
    if (!validToken) {
      if (isTokenExpired(decryptedUserToken)) {
        throw new UnauthorizedCustomResponse({
          title: 'User token is expired',
          key: CustomErrorKeys.USER_TOKEN_EXPIRED,
          detail: 'User token is expired',
        });
      } else {
        throw new UnauthorizedCustomResponse({
          title: 'Invalid user token',
          key: CustomErrorKeys.USER_TOKEN_NOT_VALID,
          detail: 'Invalid user token',
        });
      }
    }
    const storedAppUser = await this.appUsersService.findByUserCredentials(
      validToken.username,
    );
    this.alsService.set(AlsKeysEnum.APP_USER, storedAppUser);
  }

  onModuleInit() {
    const fastifyInstance = (global as any).fastifyInstance as FastifyInstance;
    if (fastifyInstance) {
      fastifyInstance.addHook('preHandler', this.userTokenHook.bind(this));
    }
  }
}
