import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './shared/filters/http-exceptions.filter';
import { IdempotencyKeysService } from './idempotency-keys/idempotency-keys.service';
import { RedisService } from './shared/services/redis/redis.service';
import { loadModules } from './shared/constants';
import { AsyncStorageService } from './shared/services/als/als.service';
import { OwnPlatformTokenMiddleware } from './shared/middleware/own-platform-token.middleware';
import { ClientTokenHookService } from './shared/services/hooks/client-token-hook.service';
import { UserTokenHookService } from './shared/services/hooks/user-token-hook.service';
import { PlatformsService } from './modules/platforms/platforms.service';
import { ownPlatformMock } from './shared/mocks/own-platform.mock';
import { PlatformConfigurationsService } from './modules/platform-configurations/platform-configurations.service';
import { ClientsService } from './modules/clients/clients.service';
import { clientFrontendMock } from './shared/mocks/client-frontend.mock';

@Module({
  imports: [...loadModules()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER, // Provide the global exception filter.
      useClass: AllExceptionsFilter,
    },
    Logger,
    AppService,
    IdempotencyKeysService,
    RedisService,
    ClientTokenHookService,
    UserTokenHookService,
  ],
})
export class AppModule implements NestModule {
  constructor(
    private readonly alsService: AsyncStorageService,
    private readonly platformService: PlatformsService,
    private readonly platformConfigurationsService: PlatformConfigurationsService,
    private readonly clientsService: ClientsService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    // bind the middleware,
    consumer
      .apply((req, res, next) => {
        this.runAsyncStorageService(req, next);
      })
      .forRoutes('*');
    consumer.apply(OwnPlatformTokenMiddleware).forRoutes('*');
  }

  private runAsyncStorageService(req: any, next: any) {
    // populate the store with some default values
    // based on the request,
    const fullURL = req.protocol + '://' + req.hostname + req.originalUrl;
    const startTime = new Date();
    // Crear el mapa directamente con los valores
    const store = new Map([
      ['appUser', null],
      ['startTime', startTime],
      ['url', fullURL],
      ['ip', req.ip],
      ['decrypted-client-token', null],
    ]);
    // and pass the "next" function as callback
    // to the "als.run" method together with the store.
    this.alsService.run(() => next(), store);
  }

  async onModuleInit() {
    // Platform seed
    const ownPlatform = await this.platformService.findOne({
      filterOptions: {
        name: ownPlatformMock.name,
      },
      triggerError: false,
    });
    if (!ownPlatform) {
      await this.platformService.createPlatform(ownPlatformMock);
    }

    if (/development/.test(process.env.NODE_ENV)) {
      const frontendClient = await this.clientsService.findOne({
        filterOptions: {
          name: clientFrontendMock.name,
        },
        triggerError: false,
      });
      if (!frontendClient) {
        await this.platformService.assignClientToPlatform(clientFrontendMock);
      }
    }

    /*
    if (/true/.test(this.executeSeed)) {
      console.log('Starting seed process...');
      await this.seedService.seed();
    } else {
      console.log('Seed process skipped.');
    }
      */
  }
}
