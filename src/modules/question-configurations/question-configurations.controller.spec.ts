import { Test, TestingModule } from '@nestjs/testing';
import { QuestionConfigurationsController } from './question-configurations.controller';
import { QuestionConfigurationsService } from './question-configurations.service';

describe('QuestionConfigurationsController', () => {
  let controller: QuestionConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionConfigurationsController],
      providers: [QuestionConfigurationsService],
    }).compile();

    controller = module.get<QuestionConfigurationsController>(QuestionConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
