import { Test, TestingModule } from '@nestjs/testing';
import { ExamAttemptQuestionsController } from './exam-attempt-questions.controller';
import { ExamAttemptQuestionsService } from './exam-attempt-questions.service';

describe('ExamAttemptQuestionsController', () => {
  let controller: ExamAttemptQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamAttemptQuestionsController],
      providers: [ExamAttemptQuestionsService],
    }).compile();

    controller = module.get<ExamAttemptQuestionsController>(ExamAttemptQuestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
