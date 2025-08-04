import { Test, TestingModule } from '@nestjs/testing';
import { ServiceConfigurationsController } from './service-configurations.controller';
import { ServiceConfigurationsService } from './service-configurations.service';

describe('ServiceConfigurationsController', () => {
  let controller: ServiceConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceConfigurationsController],
      providers: [ServiceConfigurationsService],
    }).compile();

    controller = module.get<ServiceConfigurationsController>(ServiceConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
