import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DocumentFoldersService } from './document-folders.service';
import { CreateDocumentFolderDto } from './dto/create-document-folder.dto';
import { DocumentFolder } from './schemas/document-folder.schema';

@Controller('document-folders')
export class DocumentFoldersController {
  constructor(private readonly documentFoldersService: DocumentFoldersService) { }

  @Post()
  async create(@Body() dto: CreateDocumentFolderDto): Promise<DocumentFolder> {
    return this.documentFoldersService.create(dto);
  }

  @Get(':id/content')
  //TODO:  validación de permisos.
  async findFolderContent(@Param('id') folderId: string) {

    // Obtenemos las subcarpetas
    const childFolders = await this.documentFoldersService.findDocumentFolder({
      filterOptions: { parent: folderId },
    });

    // Obtenemos los documentos
    const documents = await this.documentFoldersService.findDocumentFolder({
      filterOptions: { parentFolder: folderId },
    });

    return { folders: childFolders, documents };
  }
}