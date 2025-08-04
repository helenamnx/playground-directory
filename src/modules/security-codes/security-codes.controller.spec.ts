import { Test, TestingModule } from '@nestjs/testing';
import { SecurityCodesController } from './security-codes.controller';
import { SecurityCodesService } from './security-codes.service';

describe('SecurityCodesController', () => {
  let controller: SecurityCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityCodesController],
      providers: [SecurityCodesService],
    }).compile();

    controller = module.get<SecurityCodesController>(SecurityCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
