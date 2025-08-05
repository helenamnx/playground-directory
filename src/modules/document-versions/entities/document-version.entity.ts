import { PdfDocument } from '@/modules/pdf-documents/schemas/pdf-document.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';




@Schema()

export class DocumentVersion extends Thing {
    @Prop({ type: String, ref: 'PdfDocument', required: true })
    originalDocument: PdfDocument;

    @Prop({ required: true })
    name: string;
}

export const DocumentVersionSchema = SchemaFactory.createForClass(DocumentVersion);
