import { Module } from '@nestjs/common';
import { DocumentVersionsService } from './document-versions.service';
import { DocumentVersionsController } from './document-versions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentVersion, DocumentVersionSchema } from './schemas/document-version.schema';
import { PdfDocumentsModule } from '../pdf-documents/pdf-documents.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentVersion.name, schema: DocumentVersionSchema }]),
  ],
  controllers: [DocumentVersionsController],
  providers: [DocumentVersionsService],
  exports: [DocumentVersionsService],
})
export class DocumentVersionsModule { }
