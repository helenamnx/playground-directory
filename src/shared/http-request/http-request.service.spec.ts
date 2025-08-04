import { Test, TestingModule } from '@nestjs/testing';
import { HttpRequestService } from './http-request.service';

describe('HttpRequestService', () => {
  let service: HttpRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpRequestService],
    }).compile();

    service = module.get<HttpRequestService>(HttpRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
