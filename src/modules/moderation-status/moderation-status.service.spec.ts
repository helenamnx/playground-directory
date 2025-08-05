import { Test, TestingModule } from '@nestjs/testing';
import { ModerationStatusService } from './moderation-status.service';

describe('ModerationStatusService', () => {
  let service: ModerationStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModerationStatusService],
    }).compile();

    service = module.get<ModerationStatusService>(ModerationStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
