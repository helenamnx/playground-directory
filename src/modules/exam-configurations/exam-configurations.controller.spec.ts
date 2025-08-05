import { Test, TestingModule } from '@nestjs/testing';
import { ExamConfigurationsController } from './exam-configurations.controller';
import { ExamConfigurationsService } from './exam-configurations.service';

describe('ExamConfigurationsController', () => {
  let controller: ExamConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamConfigurationsController],
      providers: [ExamConfigurationsService],
    }).compile();

    controller = module.get<ExamConfigurationsController>(ExamConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
