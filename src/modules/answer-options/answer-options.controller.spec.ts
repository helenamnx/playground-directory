import { Test, TestingModule } from '@nestjs/testing';
import { AnswerOptionsController } from './answer-options.controller';
import { AnswerOptionsService } from './answer-options.service';

describe('AnswerOptionsController', () => {
  let controller: AnswerOptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerOptionsController],
      providers: [AnswerOptionsService],
    }).compile();

    controller = module.get<AnswerOptionsController>(AnswerOptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
