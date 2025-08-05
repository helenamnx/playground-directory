import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DocumentFolder, DocumentFolderSchema } from '../document-folders/schemas/document-folder.schema';
import { PdfDocument, PdfDocumentSchema } from '../pdf-documents/schemas/pdf-document.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DocumentFolder.name, schema: DocumentFolderSchema },
            { name: PdfDocument.name, schema: PdfDocumentSchema },
        ]),
    ],
    controllers: [SearchController],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule { }