import { Module } from '@nestjs/common';
import { DocumentFoldersService } from './document-folders.service';
import { DocumentFoldersController } from './document-folders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentFolder, DocumentFolderSchema } from './schemas/document-folder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentFolder.name, schema: DocumentFolderSchema },
    ]),

  ],
  controllers: [DocumentFoldersController],
  providers: [DocumentFoldersService],
  exports: [DocumentFoldersService], // Exportar el servicio para que esté disponible en otros módulos
})
export class DocumentFoldersModule { }
