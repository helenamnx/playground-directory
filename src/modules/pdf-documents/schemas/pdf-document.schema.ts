import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class PdfDocument extends Thing {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    contentUrl: string;

    @Prop({ type: Types.ObjectId, ref: 'DocumentFolder', required: true })
    parentFolder: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    creator: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'DocumentVersionSeries' })
    versionSeries: Types.ObjectId;

    @Prop({ required: true, default: true })
    isLatestVersion: boolean;

    @Prop({ type: Object, default: {} })
    annotations: object;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'UserRole' }], default: [] })
    allowedRoles: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }], default: [] })
    allowedGroups: Types.ObjectId[];

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ type: String, default: '' })
    indexedContent: string;
}

export const PdfDocumentSchema = SchemaFactory.createForClass(PdfDocument);
