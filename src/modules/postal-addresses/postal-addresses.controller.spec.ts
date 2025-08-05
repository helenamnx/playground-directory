import { Test, TestingModule } from '@nestjs/testing';
import { PostalAddressesController } from './postal-addresses.controller';
import { PostalAddressesService } from './postal-addresses.service';

describe('PostalAddressesController', () => {
  let controller: PostalAddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostalAddressesController],
      providers: [PostalAddressesService],
    }).compile();

    controller = module.get<PostalAddressesController>(PostalAddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
