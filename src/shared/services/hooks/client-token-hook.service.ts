import { Injectable, OnModuleInit } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { FastifyInstance } from 'fastify';
import { CustomErrorKeys } from '../../enums/error-keys.enum';
import { UnauthorizedCustomResponse } from '../../responses/error/custom-error-response';
import { AuthService } from '@/modules/auth/auth.service';
import { AsyncStorageService } from '../als/als.service';
import { decodeToken, getTokenFromBearer } from '../../utils/token.utils';
import { ConfigService } from '@nestjs/config';
import { ClientsService } from '@/modules/clients/clients.service';

@Injectable()
export class ClientTokenHookService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly alsService: AsyncStorageService,
    private readonly configService: ConfigService,
    private readonly clientsService: ClientsService,
  ) {}
  async clientTokenHook(req: FastifyRequest, reply: FastifyReply) {
    const appVersion = this.configService.get<string>('APP_VERSION');
    const excludedRoutes = [
      `/${appVersion}/auth/refresh-token`,
      `/${appVersion}/auth/client-token`,
      `/${appVersion}`,
    ]; //TODO: ver manera para evitar usar excluedRoutes
    if (excludedRoutes.includes(req.routeOptions.url)) {
      return;
    }

    const clientToken = req.headers['client-token'];
    if (!clientToken) {
      throw new UnauthorizedCustomResponse({
        title: 'Missing client token',
        key: CustomErrorKeys.MISSING_CLIENT_TOKEN,
        detail: 'Missing client token',
      });
    }
    const clientAccessToken = getTokenFromBearer(clientToken as string);
    const validToken = await this.authService.verifyTokenSession({
      access_token: clientAccessToken,
    });
    if (!validToken) {
      throw new UnauthorizedCustomResponse({
        title: 'Invalid client token',
        key: CustomErrorKeys.CLIENT_TOKEN_NOT_VALID,
        detail: 'Invalid client token',
      });
    }
    const decryptedClientToken = decodeToken(clientToken as string);
    const storedClient = await this.clientsService.findOne({
      populateOptions: ['configuration'],
      filterOptions: {
        externalIds: {
          $elemMatch: {
            kcID: decryptedClientToken.sub,
          },
        },
      },
      triggerError: false,
    });
    if (!storedClient) {
      throw new UnauthorizedCustomResponse({
        title: 'Client not found',
        key: CustomErrorKeys.CLIENT_TOKEN_NOT_VALID,
        detail: 'Invalid client token',
      });
    }
    if (!storedClient.configuration.isActive) {
      throw new UnauthorizedCustomResponse({
        title: 'Client not active',
        key: CustomErrorKeys.CLIENT_IS_NOT_ACTIVE,
        detail: 'Client token is not active',
      });
    }

    this.alsService.set('decrypted-client-token', decryptedClientToken);
  }

  onModuleInit() {
    const fastifyInstance = (global as any).fastifyInstance as FastifyInstance;
    if (fastifyInstance) {
      fastifyInstance.addHook('preHandler', this.clientTokenHook.bind(this));
    }
  }
}
