import { Test, TestingModule } from '@nestjs/testing';
import { ExamRulesController } from './exam-rules.controller';
import { ExamRulesService } from './exam-rules.service';

describe('ExamRulesController', () => {
  let controller: ExamRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamRulesController],
      providers: [ExamRulesService],
    }).compile();

    controller = module.get<ExamRulesController>(ExamRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
