import { Test, TestingModule } from '@nestjs/testing';
import { ExamAttemptStatusesService } from './exam-attempt-statuses.service';

describe('ExamAttemptStatusesService', () => {
  let service: ExamAttemptStatusesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamAttemptStatusesService],
    }).compile();

    service = module.get<ExamAttemptStatusesService>(ExamAttemptStatusesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
