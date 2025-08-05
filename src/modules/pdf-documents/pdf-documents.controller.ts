import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, Req, UseInterceptors } from '@nestjs/common';
import { PdfDocumentsService } from './pdf-documents.service';
import { CreatePdfDocumentDto } from './dto/create-pdf-document.dto';
import { UpdatePdfDocumentDto } from './dto/update-pdf-document.dto';
import { PdfDocument } from './schemas/pdf-document.schema';
import { FastifyPdfInterceptor } from '@/shared/interceptors/fastify-pdf.interceptor';

@Controller('pdf-documents')
export class PdfDocumentsController {
  constructor(private readonly pdfDocumentsService: PdfDocumentsService) { }

  @Post()
  @UseInterceptors(FastifyPdfInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any
  ): Promise<PdfDocument> {
    // Validar que el archivo existe
    if (!file) {
      throw new Error('No se ha proporcionado un archivo PDF');
    }

    // Construir el DTO con todos los campos requeridos
    const dto: CreatePdfDocumentDto = {
      name: body.name,
      contentUrl: file.path, // Se asignará en el servicio
      parentFolderId: body.parentFolderId,
      creator: req.user?.id || body.creator || 'id-de-usuario-aleatorio',
      slug: body.slug, // Se generará en el servicio si no se proporciona
      versionSeries: body.versionSeries,
      isLatestVersion: body.isLatestVersion !== undefined ? Boolean(body.isLatestVersion) : true,
      annotations: body.annotations ? JSON.parse(body.annotations) : undefined,
      allowedRoles: body.allowedRoles ? JSON.parse(body.allowedRoles) : undefined,
      allowedGroups: body.allowedGroups ? JSON.parse(body.allowedGroups) : undefined,
      indexedContent: body.indexedContent
    };

    return this.pdfDocumentsService.createDocument(dto, file);
  }
}
