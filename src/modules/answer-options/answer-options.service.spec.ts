import { Test, TestingModule } from '@nestjs/testing';
import { AnswerOptionsService } from './answer-options.service';

describe('AnswerOptionsService', () => {
  let service: AnswerOptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnswerOptionsService],
    }).compile();

    service = module.get<AnswerOptionsService>(AnswerOptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
