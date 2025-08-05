import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './shared/filters/http-exceptions.filter';
import { IdempotencyKeysService } from './idempotency-keys/idempotency-keys.service';
import { RedisService } from './shared/services/redis/redis.service';
import { loadModules } from './shared/constants';
import { AsyncStorageService } from './shared/services/als/als.service';
import { ClientTokenHookService } from './shared/services/hooks/client-token-hook.service';
import { UserTokenHookService } from './shared/services/hooks/user-token-hook.service';
import { OwnPlatformTokenMiddleware } from './shared/middleware/own-platform-token.middleware';
import { CategorySeedService } from './shared/database/migration/category-seed.service';
import { AlsKeysEnum } from './shared/enums/als-keys.enum';
import { QuestionSeedService } from './shared/database/migration/question.seed.service';
import { doPagination } from './shared/utils/pagination.util';
import { doFilterOptions } from './shared/utils/filter-options.util';
import { LanguagesEnum } from './shared/enums/languages.enum';
import { NodeEnvEnum } from './shared/enums/node-env.enum';
import { UsersMigrationService } from './shared/database/migration/users-migration.service';
import { AppSeedService } from './shared/database/seed/app-seed.service';
import { MigrationSheetNamesEnum } from './shared/enums/migration-sheet-names.enum';
import { VisibilityFilterInterceptor } from './shared/interceptors/visibility-filter.interceptor';
import { PdfDocumentsModule } from './modules/pdf-documents/pdf-documents.module';
import { DocumentVersionsModule } from './modules/document-versions/document-versions.module';

@Module({
  imports: [...loadModules()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER, // Provide the global exception filter.
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: VisibilityFilterInterceptor,
    },
    Logger,
    AppService,
    IdempotencyKeysService,
    RedisService,
    ClientTokenHookService,
    UserTokenHookService,
    AppSeedService,
  ],
})
export class AppModule implements NestModule {
  constructor(
    private readonly alsService: AsyncStorageService,
    private readonly appSeedService: AppSeedService,
    private readonly categorySeedService: CategorySeedService,

    private readonly questionSeedService: QuestionSeedService,

    private readonly usersMigrationService: UsersMigrationService,
  ) { }

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
    const {
      APP_USER,
      START_TIME,
      URL,
      IP,
      CLIENT,
      DEFAULT_LANGUAGE,
      PAGINATION_PARAMS,
      FILTER_OPTIONS,
    } = AlsKeysEnum;
    // Crear el mapa directamente con los valores
    const store = new Map([
      [APP_USER, null],
      [START_TIME, startTime],
      [URL, fullURL],
      [IP, req.ip],
      [CLIENT, null],
      [DEFAULT_LANGUAGE, LanguagesEnum.EN],
      [PAGINATION_PARAMS, doPagination(req)],
      [FILTER_OPTIONS, doFilterOptions(req)],
    ]);
    // and pass the "next" function as callback
    // to the "als.run" method together with the store.
    this.alsService.run(() => next(), store);
  }

  async onModuleInit() {
    const filePath = process.env.MIGRATION_FILE_PATH;
    // if the environment is not test, migrate the categories and questions
    if (process.env.NODE_ENV !== NodeEnvEnum.TEST) {
      //await this.usersMigrationService.migrateUsersFromFile();
      await this.categorySeedService.migrateCategories({
        filePath: filePath,
        sheetName: MigrationSheetNamesEnum.FASE_PRESENCIAL,
      });
      await this.questionSeedService.migrateQuestions({
        filePath: filePath,
        sheetName: MigrationSheetNamesEnum.FASE_PRESENCIAL,
      });
    }
    await this.appSeedService.seedApp();
  }
}
