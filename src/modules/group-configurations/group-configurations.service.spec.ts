import { Test, TestingModule } from '@nestjs/testing';
import { GroupConfigurationsService } from './group-configurations.service';

describe('GroupConfigurationsService', () => {
  let service: GroupConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupConfigurationsService],
    }).compile();

    service = module.get<GroupConfigurationsService>(GroupConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
