import { Injectable } from '@nestjs/common';
import serviceMockDev from '@/shared/database/data/seed-mocks/development-seed/service.mock.json';
import { ServicesService } from '@/modules/services/services.service';
import {
  compileVariablesFromJSON,
  noCompileVariablePipe,
} from '../../utils/handlebars.utils';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';

@Injectable()
export class ServicesSeedService {
  private readonly serviceMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? serviceMockDev
      : serviceMockDev; //TODO: add seed for production

  constructor(private readonly servicesService: ServicesService) {}

  async seedService() {
    try {
      const servicesCount = await this.servicesService.countDocuments();
      if (servicesCount > 0) return;
      noCompileVariablePipe();
      const compiledService = compileVariablesFromJSON(this.serviceMock, {
        AUTH_BASE_URL: process.env.AUTH_BASE_URL,
      });

      //Verify if the platform already exists
      const existingPlatform = await this.servicesService.findOne({
        filterOptions: {
          alias: compiledService.alias,
        },
        triggerError: false,
      });
      if (existingPlatform) {
        console.log(
          `Service "${this.serviceMock.name}" already exists. Skipping seed.`,
        );
        return;
      }

      // Create the platform using the PlatformsService
      await this.servicesService.create(compiledService);
      console.log('Services seeded successfully.');
    } catch (error) {
      console.error('Error seeding platforms:', error);
      throw error;
    }
  }
}
