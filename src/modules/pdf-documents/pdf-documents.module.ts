import { Module } from '@nestjs/common';
import { PdfDocumentsService } from './pdf-documents.service';
import { PdfDocumentsController } from './pdf-documents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PdfDocument, PdfDocumentSchema } from './schemas/pdf-document.schema';
import { DocumentFoldersModule } from '../document-folders/document-folders.module';
import { DocumentVersionsModule } from '@/modules/document-versions/document-versions.module';
import { MulterConfigModule } from '@/config/multer/multer.module';
import { DocumentVersioningService } from './services/document-versioning.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PdfDocument.name, schema: PdfDocumentSchema },
    ]),
    DocumentFoldersModule,
    DocumentVersionsModule,
    MulterConfigModule,
  ],
  controllers: [PdfDocumentsController],
  providers: [PdfDocumentsService, DocumentVersioningService],
})
export class PdfDocumentsModule { }
