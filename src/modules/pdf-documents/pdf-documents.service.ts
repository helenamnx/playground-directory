import { Injectable } from '@nestjs/common';
import { CreatePdfDocumentDto } from './dto/create-pdf-document.dto';
import { UpdatePdfDocumentDto } from './dto/update-pdf-document.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PdfDocument } from './schemas/pdf-document.schema';
import { generateSlug } from '@/shared/utils/generate-slug.utils';
import { readFileSync } from 'fs';
import { DocumentFoldersService } from '../document-folders/document-folders.service';
import { DocumentVersion } from '../document-versions/entities/document-version.entity';
const pdfParse = require('pdf-parse');

@Injectable()
export class PdfDocumentsService extends CRUDService<PdfDocument> {
  constructor(
    @InjectModel(PdfDocument.name) private readonly documentModel: Model<PdfDocument>,
    @InjectModel(DocumentVersion.name) private readonly versionSeriesModel: Model<DocumentVersion>,
    private readonly documentFoldersService: DocumentFoldersService,
  ) {
    super(documentModel);
  }

  async createDocument(dto: CreatePdfDocumentDto, file: Express.Multer.File): Promise<PdfDocument> {
    // 1. Verificar la existencia de la carpeta padre
    const parentFolder = await this.documentFoldersService.findOne({
      filterOptions: { _id: dto.parentFolderId },
      triggerError: true,
    });

    // 2. Extraer el texto del PDF con pdf-parse
    const buffer = readFileSync(file.path);
    const pdfData = await pdfParse(buffer);
    const indexedContent = pdfData.text;

    // 3. Generar el slug y crear el documento en la base de datos primero
    const documentSlug = generateSlug(dto.name);

    const newDocument = await super.create({
      name: dto.name,
      contentUrl: file.path,
      parentFolder: parentFolder._id,
      creator: dto.creator, // Suponemos que el ID del creador viene en el DTO
      slug: documentSlug,
      indexedContent: indexedContent, // Guardamos el texto extraído
    }) as PdfDocument;

    // 4. Crear la serie de versiones con el documento original ya disponible
    const versionSeries = await this.versionSeriesModel.create({
      name: dto.name,
      originalDocument: newDocument._id,
    });

    // 5. Vincular la serie de versiones con el documento
    newDocument.versionSeries = versionSeries._id as any;
    await newDocument.save();

    return newDocument;
  }
}

