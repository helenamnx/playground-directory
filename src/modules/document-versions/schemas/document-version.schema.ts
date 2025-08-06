import { PdfDocument } from '@/modules/pdf-documents/schemas/pdf-document.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class DocumentVersion extends Thing {
    @Prop({ type: String, ref: 'PdfDocument', required: true })
    originalDocument: PdfDocument; // Restaurar el tipo correcto

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    isLatestVersion: boolean;

    @Prop({ type: String, default: '' })
    versionType: string; // Tipo de versión (ej: "major", "minor", "patch")
}

export const DocumentVersionSchema = SchemaFactory.createForClass(DocumentVersion);
