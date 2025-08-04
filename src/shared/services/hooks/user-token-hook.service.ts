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

@Injectable()
export class UserTokenHookService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly alsService: AsyncStorageService,
    private readonly configService: ConfigService,
    private readonly entitiesService: EntitiesService,
    //   private readonly entitiesService: EntitiesService,
    // private readonly servicesService: ServicesService,
  ) {}
  async userTokenHook(req: any, reply: FastifyReply) {
    const appVersion = this.configService.get<string>('APP_VERSION');
    const excludedRoutes = [`/${appVersion}/auth/refresh-token`]; //TODO: ver manera para evitar usar excluedRoutes

    if (excludedRoutes.includes(req.routeOptions.url)) {
      return;
    }
    const userToken = req.headers['authorization'];
    if (!userToken) {
      // throw new UnauthorizedCustomResponse({
      //   title: 'Missing user token',
      //   key: CustomErrorKeys.MISSING_USER_TOKEN,
      //   detail: 'Missing user token',
      // });

      return;
    }
    // // TODO: dejar de usar
    // const messagingPlatform = await this.servicesService.findOne({
    //   filterOptions: { name: 'fivolution-messaging' },
    //   populateOptions: ['configuration'],
    //   triggerError: false,
    // });
    // if (messagingPlatform)
    //   req.headers['messages-microservice'] = messagingPlatform;
    // const emailPlatform = await this.servicesService.findOne({
    //   filterOptions: { name: 'fivolution-email' },
    //   populateOptions: ['configuration'],
    //   triggerError: false,
    // });
    // if (emailPlatform) req.headers['email-platform'] = emailPlatform;
    const decryptedUserToken = decodeToken(userToken as string);
      const userAccessToken = getTokenFromBearer(userToken);
    const validToken =
      await this.authService.verifyUserSession(userAccessToken);
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

    // console.log(
    //   decryptedUserToken,
    //   this.alsService.get('decrypted-client-token'),
    // );
    const userRole =
      validToken.resource_access[
        this.alsService.get('decrypted-client-token').client_id
      ].roles;

    //TODO: add entities service
    const entityRole = await this.entitiesService.findEntityByRole(
      userRole[0],
      validToken.sub,
    );
  }

  onModuleInit() {
    const fastifyInstance = (global as any).fastifyInstance as FastifyInstance;
    if (fastifyInstance) {
      fastifyInstance.addHook('preHandler', this.userTokenHook.bind(this));
    }
  }
}
