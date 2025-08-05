import { PartialType } from '@nestjs/mapped-types';
import { CreatePdfDocumentDto } from './create-pdf-document.dto';

export class UpdatePdfDocumentDto extends PartialType(CreatePdfDocumentDto) {}
