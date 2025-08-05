import { Test, TestingModule } from '@nestjs/testing';
import { PdfDocumentsService } from './pdf-documents.service';

describe('PdfDocumentsService', () => {
  let service: PdfDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfDocumentsService],
    }).compile();

    service = module.get<PdfDocumentsService>(PdfDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
