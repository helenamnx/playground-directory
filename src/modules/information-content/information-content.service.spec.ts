import { Test, TestingModule } from '@nestjs/testing';
import { InformationContentService } from './information-content.service';

describe('InformationContentService', () => {
  let service: InformationContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InformationContentService],
    }).compile();

    service = module.get<InformationContentService>(InformationContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
