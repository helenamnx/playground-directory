import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Connection } from 'mongoose';
import { configureTestApp } from './configure-test-app.util';
import { setupNockMocks } from './setup-nock-mocks.util';
import nock from 'nock';
import { MongoMemoryServer } from 'mongodb-memory-server';
export let mongod: MongoMemoryServer;

export let app: NestFastifyApplication;
export let dbConnection: Connection;

beforeAll(async () => {
  const setup = await configureTestApp();
  app = setup.app;
  dbConnection = setup.dbConnection;
  setupNockMocks();
});

afterAll(async () => {
  try {
    nock.cleanAll();
    await dbConnection.dropDatabase();
    await dbConnection.close(); // Cierra la conexión a la DB

    if (mongod) {
      await mongod.stop(); // Detiene MongoDB In-Memory
    }

    await app.close(); // Cierra la aplicación
  } catch (error) {
    console.error('Error al eliminar la base de datos:', error);
  }
});

export async function clearDatabase(connection: Connection) {
  const collections = connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
    await collections[key].drop();
  }
}
