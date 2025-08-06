import { Injectable } from '@nestjs/common';
import { CreateDocumentVersionDto } from './dto/create-document-version.dto';
import { UpdateDocumentVersionDto } from './dto/update-document-version.dto';
import { DocumentVersion } from './schemas/document-version.schema';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DocumentVersionsService extends CRUDService<DocumentVersion> {
  constructor(
    @InjectModel(DocumentVersion.name) 
    private readonly documentVersionModel: Model<DocumentVersion>,
  ) {
    super(documentVersionModel);
  }

  async createDocumentVersion(dto: CreateDocumentVersionDto): Promise<DocumentVersion> {
    const newVersion = await super.create(dto);
    return newVersion;
  }

  async updateDocumentVersion(id: string, dto: UpdateDocumentVersionDto): Promise<DocumentVersion> {
    const updatedVersion = await super.update(id, dto);
    return updatedVersion;
  }



}
