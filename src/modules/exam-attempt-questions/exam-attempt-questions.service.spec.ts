import { Test, TestingModule } from '@nestjs/testing';
import { ExamAttemptQuestionsService } from './exam-attempt-questions.service';

describe('ExamAttemptQuestionsService', () => {
  let service: ExamAttemptQuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamAttemptQuestionsService],
    }).compile();

    service = module.get<ExamAttemptQuestionsService>(ExamAttemptQuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
