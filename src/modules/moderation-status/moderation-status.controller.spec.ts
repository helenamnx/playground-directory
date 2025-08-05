import { Test, TestingModule } from '@nestjs/testing';
import { ModerationStatusController } from './moderation-status.controller';
import { ModerationStatusService } from './moderation-status.service';

describe('ModerationStatusController', () => {
  let controller: ModerationStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModerationStatusController],
      providers: [ModerationStatusService],
    }).compile();

    controller = module.get<ModerationStatusController>(ModerationStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
