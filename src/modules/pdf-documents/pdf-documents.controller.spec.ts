import { Test, TestingModule } from '@nestjs/testing';
import { PdfDocumentsController } from './pdf-documents.controller';
import { PdfDocumentsService } from './pdf-documents.service';

describe('PdfDocumentsController', () => {
  let controller: PdfDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfDocumentsController],
      providers: [PdfDocumentsService],
    }).compile();

    controller = module.get<PdfDocumentsController>(PdfDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
