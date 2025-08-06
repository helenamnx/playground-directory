import { DocumentFolder } from '@/modules/document-folders/schemas/document-folder.schema';
// Eliminar importación de DocumentVersion para evitar dependencia circular
import { Group } from '@/modules/groups/schemas/group.schema';
import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import { User } from '@/modules/users/schemas/user.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class PdfDocument extends Thing {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    contentUrl: string;

    @Prop({ type: String, ref: 'DocumentFolder', required: true })
    parentFolder: DocumentFolder;

    @Prop({ type: String, ref: 'User', required: true })
    creator: User;

    @Prop({ required: true, default: true })
    isLatestVersion: boolean;

    @Prop({ type: Object, default: {} })
    annotations: object;

    @Prop({ type: [{ type: String, ref: 'UserRole' }], default: [] })
    allowedRoles: UserRole[];

    @Prop({ type: [{ type: String, ref: 'Group' }], default: [] })
    allowedGroups: Group[];

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ type: String, default: '' })
    indexedContent: string;
}

export const PdfDocumentSchema = SchemaFactory.createForClass(PdfDocument);
