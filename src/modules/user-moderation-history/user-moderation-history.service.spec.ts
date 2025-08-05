import { Test, TestingModule } from '@nestjs/testing';
import { UserModerationHistoryService } from './user-moderation-history.service';

describe('UserModerationHistoryService', () => {
  let service: UserModerationHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserModerationHistoryService],
    }).compile();

    service = module.get<UserModerationHistoryService>(UserModerationHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
