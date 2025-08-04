import { Test, TestingModule } from '@nestjs/testing';
import { PlatformConfigurationsController } from './platform-configurations.controller';
import { PlatformConfigurationsService } from './platform-configurations.service';

describe('PlatformConfigurationsController', () => {
  let controller: PlatformConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformConfigurationsController],
      providers: [PlatformConfigurationsService],
    }).compile();

    controller = module.get<PlatformConfigurationsController>(PlatformConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
