import { Test, TestingModule } from '@nestjs/testing';
import { ExamConfigurationsService } from './exam-configurations.service';

describe('ExamConfigurationsService', () => {
  let service: ExamConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamConfigurationsService],
    }).compile();

    service = module.get<ExamConfigurationsService>(ExamConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
