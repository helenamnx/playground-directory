import { Module } from '@nestjs/common';
import { PdfDocumentsService } from './pdf-documents.service';
import { PdfDocumentsController } from './pdf-documents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PdfDocument, PdfDocumentSchema } from './schemas/pdf-document.schema';
import { DocumentFoldersModule } from '../document-folders/document-folders.module';
import { DocumentVersionsModule } from '@/modules/document-versions/document-versions.module';
import { DocumentVersion, DocumentVersionSchema } from '../document-versions/entities/document-version.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PdfDocument.name, schema: PdfDocumentSchema },
      { name: DocumentVersion.name, schema: DocumentVersionSchema }
    ]),
    DocumentFoldersModule,
    DocumentVersionsModule,
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'directory'),
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
    }),
  ],
  controllers: [PdfDocumentsController],
  providers: [PdfDocumentsService],
})
export class PdfDocumentsModule { }
