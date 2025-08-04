import { AppModule } from '@/app.module';
import { setupGlobalPipes } from '@/config/app.utils';
import { getConnectionToken } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TestingModule, Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer; // Servidor de MongoDB en memoria

export const configureTestApp = async () => {
  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();

  process.env.DATABASE_URI = mongoUri;
  process.env.DATABASE_NAME = 'test-db';

  //base url is getting overrided to "/" for some reason. Needs to be fixed
  process.env.BASE_URL = 'http://localhost:3006'; //TODO: set the base url for the test in a better way

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  await app.init();

  // Set the global prefix for all routes
  app.setGlobalPrefix('v1');
  setupGlobalPipes(app);
  await app.getHttpAdapter().getInstance().ready();
  const dbConnection = moduleFixture.get<Connection>(getConnectionToken());

  return { app, dbConnection };
};
