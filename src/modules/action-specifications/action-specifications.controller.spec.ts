import { Test, TestingModule } from '@nestjs/testing';
import { ActionSpecificationsController } from './action-specifications.controller';
import { ActionSpecificationsService } from './action-specifications.service';

describe('ActionSpecificationsController', () => {
  let controller: ActionSpecificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionSpecificationsController],
      providers: [ActionSpecificationsService],
    }).compile();

    controller = module.get<ActionSpecificationsController>(ActionSpecificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
