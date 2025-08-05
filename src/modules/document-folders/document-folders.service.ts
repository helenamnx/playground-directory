import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DocumentFolder } from './schemas/document-folder.schema';
import { CreateDocumentFolderDto } from './dto/create-document-folder.dto';
import { ConflictCustomResponse } from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { generateSlug } from '@/shared/utils/generate-slug.utils';

@Injectable()
export class DocumentFoldersService extends CRUDService<DocumentFolder> {
  constructor(
    @InjectModel(DocumentFolder.name)
    private readonly documentFolderModel: Model<DocumentFolder>,
  ) {
    super(documentFolderModel);
  }

  async create(dto: CreateDocumentFolderDto): Promise<DocumentFolder> {
    const { name, parentFolderId } = dto;
    let parentFolder = null;
    if (parentFolderId) {
      parentFolder = await this.findOne({
        filterOptions: { _id: parentFolderId },
        triggerError: true,
      });
    }

    // const folderSlug = generateSlug(name);
    const existingFolder = await this.findOne({
      filterOptions: { parent: parentFolderId },
      triggerError: false,
    });

    if (existingFolder) {
      throw new ConflictCustomResponse({
        title: 'Folder already exists',
        key: CustomErrorKeys.FOLDER_ALREADY_EXISTS,
        detail: `A folder with the name "${name}" already exists in this location.`,
      });
    }

    const newFolderData = {
      name,
      parent: parentFolder ? parentFolder._id : null,
      allowedGroups: dto.allowedGroups || [],
    };

    return super.create(newFolderData);
  }

  async findDocumentFolder(options: {
    filterOptions?: Record<string, any>;
    projection?: Record<string, any>;
    sortOptions?: Record<string, any>;
    limit?: number;
    skip?: number;
  }): Promise<DocumentFolder[]> {
    const { filterOptions, projection, sortOptions, limit, skip } = options;
    return this.documentFolderModel.find(filterOptions, projection)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .exec();
  }
}