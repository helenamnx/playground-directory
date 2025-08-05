import { Test, TestingModule } from '@nestjs/testing';
import { ExamAttemptStatusesController } from './exam-attempt-statuses.controller';
import { ExamAttemptStatusesService } from './exam-attempt-statuses.service';

describe('ExamAttemptStatusesController', () => {
  let controller: ExamAttemptStatusesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamAttemptStatusesController],
      providers: [ExamAttemptStatusesService],
    }).compile();

    controller = module.get<ExamAttemptStatusesController>(ExamAttemptStatusesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
