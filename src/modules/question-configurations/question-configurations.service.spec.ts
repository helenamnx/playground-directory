import { Test, TestingModule } from '@nestjs/testing';
import { QuestionConfigurationsService } from './question-configurations.service';

describe('QuestionConfigurationsService', () => {
  let service: QuestionConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionConfigurationsService],
    }).compile();

    service = module.get<QuestionConfigurationsService>(QuestionConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
