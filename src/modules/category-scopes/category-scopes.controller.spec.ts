import { Test, TestingModule } from '@nestjs/testing';
import { CategoryScopesController } from './category-scopes.controller';
import { CategoryScopesService } from './category-scopes.service';

describe('CategoryScopesController', () => {
  let controller: CategoryScopesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryScopesController],
      providers: [CategoryScopesService],
    }).compile();

    controller = module.get<CategoryScopesController>(CategoryScopesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
