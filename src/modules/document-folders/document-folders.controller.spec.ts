import { Test, TestingModule } from '@nestjs/testing';
import { DocumentFoldersController } from './document-folders.controller';
import { DocumentFoldersService } from './document-folders.service';

describe('DocumentFoldersController', () => {
  let controller: DocumentFoldersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentFoldersController],
      providers: [DocumentFoldersService],
    }).compile();

    controller = module.get<DocumentFoldersController>(DocumentFoldersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
