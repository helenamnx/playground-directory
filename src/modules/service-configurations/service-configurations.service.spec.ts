import { Test, TestingModule } from '@nestjs/testing';
import { ServiceConfigurationsService } from './service-configurations.service';

describe('ServiceConfigurationsService', () => {
  let service: ServiceConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceConfigurationsService],
    }).compile();

    service = module.get<ServiceConfigurationsService>(ServiceConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
