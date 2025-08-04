import { Test, TestingModule } from '@nestjs/testing';
import { PlatformConfigurationsService } from './platform-configurations.service';

describe('PlatformConfigurationsService', () => {
  let service: PlatformConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlatformConfigurationsService],
    }).compile();

    service = module.get<PlatformConfigurationsService>(PlatformConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
