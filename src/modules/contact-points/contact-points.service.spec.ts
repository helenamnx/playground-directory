import { Test, TestingModule } from '@nestjs/testing';
import { ContactPointsService } from './contact-points.service';

describe('ContactPointsService', () => {
  let service: ContactPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactPointsService],
    }).compile();

    service = module.get<ContactPointsService>(ContactPointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
