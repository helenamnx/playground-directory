import { Test, TestingModule } from '@nestjs/testing';
import { UserModerationHistoryController } from './user-moderation-history.controller';
import { UserModerationHistoryService } from './user-moderation-history.service';

describe('UserModerationHistoryController', () => {
  let controller: UserModerationHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserModerationHistoryController],
      providers: [UserModerationHistoryService],
    }).compile();

    controller = module.get<UserModerationHistoryController>(UserModerationHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
