import { Test, TestingModule } from '@nestjs/testing';
import { InformationContentController } from './information-content.controller';
import { InformationContentService } from './information-content.service';

describe('InformationContentController', () => {
  let controller: InformationContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformationContentController],
      providers: [InformationContentService],
    }).compile();

    controller = module.get<InformationContentController>(InformationContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
