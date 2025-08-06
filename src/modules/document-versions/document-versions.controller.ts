import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentVersionsService } from './document-versions.service';
import { CreateDocumentVersionDto } from './dto/create-document-version.dto';
import { UpdateDocumentVersionDto } from './dto/update-document-version.dto';

@Controller('document-versions')
export class DocumentVersionsController {
  constructor(private readonly documentVersionsService: DocumentVersionsService) { }

  @Post()
  create(@Body() createDocumentVersionDto: CreateDocumentVersionDto) {
    return this.documentVersionsService.create(createDocumentVersionDto);
  }


}