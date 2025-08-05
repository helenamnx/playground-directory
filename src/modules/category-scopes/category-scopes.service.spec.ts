import { Test, TestingModule } from '@nestjs/testing';
import { CategoryScopesService } from './category-scopes.service';

describe('CategoryScopesService', () => {
  let service: CategoryScopesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryScopesService],
    }).compile();

    service = module.get<CategoryScopesService>(CategoryScopesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
