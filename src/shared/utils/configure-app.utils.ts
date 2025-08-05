import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { Logger, UseGuards } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { corsConfig } from 'src/config/cors.config';
import { setupGlobalPipes } from './app.utils';
import { winstonLoggerConfig } from 'src/config/log/winston.config';
import { setupRequestLogging } from 'src/shared/utils/app.utils';
import fastifyStatic from '@fastify/static';
import fastifyMulter from 'fastify-multer';
import fastify from 'fastify';
import { UserTokenGuard } from '../guards/user-token.guard';
import { AuthService } from '@/modules/auth/auth.service';
import { AsyncStorageService } from '../services/als/als.service';
import { multipart } from 'fastify-multipart';

export const fastifyInstance = fastify();

export const configureApp = async () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
    { logger: winstonLoggerConfig('mnxo-uoapp-backend') },
  );
  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get<string>('PORT', '3000');
  const appVersion = configService.get<string>('APP_VERSION');

  // Set the global prefix for all routes
  app.useGlobalInterceptors();
  app.setGlobalPrefix(appVersion);
  app.enableCors(corsConfig);

  setupGlobalPipes(app);
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
