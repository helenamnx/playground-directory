import { Injectable } from '@nestjs/common';
import { CreatePdfDocumentDto } from './dto/create-pdf-document.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PdfDocument } from './schemas/pdf-document.schema';
import { generateSlug } from '@/shared/utils/generate-slug.utils';
import { readFileSync } from 'fs';
import { DocumentFoldersService } from '../document-folders/document-folders.service';
import { DocumentVersionsService } from '../document-versions/document-versions.service';
import { CreateDocumentVersionDto } from '../document-versions/dto/create-document-version.dto';
import { DocumentVersioningService } from './services/document-versioning.service';
const pdfParse = require('pdf-parse');

@Injectable()
export class PdfDocumentsService extends CRUDService<PdfDocument> {
  constructor(
    @InjectModel(PdfDocument.name)
    private readonly documentModel: Model<PdfDocument>,
    private readonly documentFoldersService: DocumentFoldersService,
    private readonly documentVersionsService: DocumentVersionsService,
    private readonly documentVersioningService: DocumentVersioningService,
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

    // 3. Usar el nombre original del archivo como nombre del documento
    const documentName = file.originalname;
    const documentSlug = generateSlug(documentName);

    const newDocument = await super.create({
      name: documentName, // Usar el nombre del archivo subido
      contentUrl: file.path,
      parentFolder: parentFolder._id,
      creator: dto.creator,
      slug: documentSlug,
      indexedContent: indexedContent, // Guardamos el texto extraído
    }) as PdfDocument;

    // 4. Generar automáticamente el nombre de la versión
    const versionName = await this.documentVersioningService.generateNextVersionName(
      documentName // Solo necesita el nombre del documento
    );

    console.log(`=== VERSIONADO AUTOMÁTICO ===`);
    console.log(`Documento: ${documentName}`);
    console.log(`Versión generada: ${versionName}`);
    console.log(`=============================`);

    // 5. Crear la versión del documento con nombre auto-generado
    await this.documentVersionsService.createDocumentVersion({
      originalDocument: newDocument._id,
      name: versionName, // Usar versión auto-generada (ej: v0.0.0, v0.0.1)
      isLatestVersion: true,
    } as CreateDocumentVersionDto);



    return newDocument;
  }

  async updatePdfDocument(id: string, dto: CreatePdfDocumentDto): Promise<PdfDocument> {
    // 1. Verificar la existencia del documento
    const document = await this.findOne({
      filterOptions: { _id: id },
      triggerError: true,
    });

    // 2. Actualizar los campos necesarios
    const updatedDocument = await super.update(id, {
      name: dto.name,
      slug: dto.slug || generateSlug(dto.name),
      parentFolder: dto.parentFolderId,
      allowedRoles: dto.allowedRoles,
      allowedGroups: dto.allowedGroups,
      indexedContent: dto.indexedContent,
    });

    return updatedDocument;
  }
}

