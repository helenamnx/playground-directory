import { Test, TestingModule } from '@nestjs/testing';
import { ExamRulesService } from './exam-rules.service';

describe('ExamRulesService', () => {
  let service: ExamRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamRulesService],
    }).compile();

    service = module.get<ExamRulesService>(ExamRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
