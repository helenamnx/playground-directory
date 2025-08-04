import { Test, TestingModule } from '@nestjs/testing';
import { ClientConfigurationsController } from './client-configurations.controller';
import { ClientConfigurationsService } from './client-configurations.service';

describe('ClientConfigurationsController', () => {
  let controller: ClientConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientConfigurationsController],
      providers: [ClientConfigurationsService],
    }).compile();

    controller = module.get<ClientConfigurationsController>(ClientConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
