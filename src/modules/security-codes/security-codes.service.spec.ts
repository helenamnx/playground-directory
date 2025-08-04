import { Test, TestingModule } from '@nestjs/testing';
import { SecurityCodesService } from './security-codes.service';

describe('SecurityCodesService', () => {
  let service: SecurityCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityCodesService],
    }).compile();

    service = module.get<SecurityCodesService>(SecurityCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
