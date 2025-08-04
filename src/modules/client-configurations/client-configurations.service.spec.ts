import { Test, TestingModule } from '@nestjs/testing';
import { ClientConfigurationsService } from './client-configurations.service';

describe('ClientConfigurationsService', () => {
  let service: ClientConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientConfigurationsService],
    }).compile();

    service = module.get<ClientConfigurationsService>(ClientConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
