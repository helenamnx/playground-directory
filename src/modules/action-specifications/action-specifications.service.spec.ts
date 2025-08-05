import { Test, TestingModule } from '@nestjs/testing';
import { ActionSpecificationsService } from './action-specifications.service';

describe('ActionSpecificationsService', () => {
  let service: ActionSpecificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionSpecificationsService],
    }).compile();

    service = module.get<ActionSpecificationsService>(ActionSpecificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
