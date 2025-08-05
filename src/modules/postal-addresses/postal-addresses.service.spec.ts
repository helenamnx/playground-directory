import { Test, TestingModule } from '@nestjs/testing';
import { PostalAddressesService } from './postal-addresses.service';

describe('PostalAddressesService', () => {
  let service: PostalAddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostalAddressesService],
    }).compile();

    service = module.get<PostalAddressesService>(PostalAddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
