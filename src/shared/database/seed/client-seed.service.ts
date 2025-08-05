import { Injectable } from '@nestjs/common';
import { PlatformsService } from '@/modules/platforms/platforms.service';
import clientMockDev from '@/shared/database/data/seed-mocks/development-seed/client.mock.json';
import Handlebars from 'handlebars';
import { ClientsService } from '@/modules/clients/clients.service';
import {
  compileVariablesFromJSON,
  noCompileVariablePipe,
} from '../../utils/handlebars.utils';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';

@Injectable()
export class ClientsSeedService {
  private readonly clientMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? clientMockDev
      : clientMockDev; //TODO: add seed for production

  constructor(private readonly clientsService: ClientsService) {}

  async seedClient() {
    try {
      const clientCount = await this.clientsService.countDocuments();
      if (clientCount > 0) return;
      noCompileVariablePipe();
      const client = compileVariablesFromJSON(this.clientMock, {
        FRONTEND_CLIENT_ID: process.env.FRONTEND_CLIENT_ID,
        FRONTEND_CLIENT_SECRET: process.env.FRONTEND_CLIENT_SECRET,
        FRONTEND_CLIENT_EMAIL: process.env.FRONTEND_CLIENT_EMAIL,
        FRONTEND_CLIENT_BASE_URL: process.env.FRONTEND_CLIENT_BASE_URL,
        FRONTEND_CLIENT_KEYCLOAK_ID: process.env.FRONTEND_CLIENT_KEYCLOAK_ID,
      });
      //Verify if the platform already exists
      const existingPlatform = await this.clientsService.findOne({
        filterOptions: {
          alias: client.alias,
        },
        triggerError: false,
      });
      if (existingPlatform) {
        console.log(
          `Client "${this.clientMock.name}" already exists. Skipping seed.`,
        );
        return;
      }

      // Create the platform using the PlatformsService
      await this.clientsService.createClient(client);
      console.log('Services seeded successfully.');
    } catch (error) {
      console.error('Error seeding platforms:', error);
      throw error;
    }
  }
}
