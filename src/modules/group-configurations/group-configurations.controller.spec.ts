import { Test, TestingModule } from '@nestjs/testing';
import { GroupConfigurationsController } from './group-configurations.controller';
import { GroupConfigurationsService } from './group-configurations.service';

describe('GroupConfigurationsController', () => {
  let controller: GroupConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupConfigurationsController],
      providers: [GroupConfigurationsService],
    }).compile();

    controller = module.get<GroupConfigurationsController>(GroupConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
