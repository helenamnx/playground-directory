import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { corsConfig } from 'src/config/cors.config';
import { setupGlobalPipes } from './app.utils';
import { winstonLoggerConfig } from 'src/config/log/winston.config';
import { filterOptionsPreHook } from '../hooks/filter-options.hook';
import { paginationPreHook } from '../hooks/pagination.hook';
import { setupRequestLogging } from 'src/shared/utils/app.utils';
import fastifyStatic from '@fastify/static';
import fastifyMulter from 'fastify-multer';
import fastify from 'fastify';

export const fastifyInstance = fastify();

export const configureApp = async () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
    { logger: winstonLoggerConfig('basic-template') },
  );
  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get<string>('PORT', '3000');
  const appVersion = configService.get<string>('APP_VERSION');

  // Set the global prefix for all routes
  app.useGlobalInterceptors();
  app.setGlobalPrefix(appVersion);
  app.enableCors(corsConfig);

  setupGlobalPipes(app);
  filterOptionsPreHook();
  paginationPreHook();
  setupRequestLogging();
  const logger = new Logger('configureApp');

  const assetsRootPath = configService.get<string>('ASSETS_ROOT_PATH');
  const assetsPrefix = configService.get<string>('ASSETS_PREFIX');
  const temporalAssetsRootPath = configService.get<string>(
    'TEMPORAL_ASSETS_ROOT_PATH',
  );
  const temporalAssetsPrefix = configService.get<string>(
    'TEMPORAL_ASSETS_PREFIX',
  );

  app.register(fastifyStatic, {
    root: assetsRootPath!,
    prefix: assetsPrefix,
    decorateReply: false,
  });

  app.register(fastifyStatic, {
    root: temporalAssetsRootPath!,
    prefix: temporalAssetsPrefix,
    decorateReply: false,
  });

  //This line is used to allow the fastify hooks to use services and modules
  (global as any).fastifyInstance = app.getHttpAdapter().getInstance();
  await app.register(fastifyMulter.contentParser);
  logger.log(`App is ready and listening on port ${port} 🚀`);

  await app.listen({ port: +port, host: '0.0.0.0' });
};
