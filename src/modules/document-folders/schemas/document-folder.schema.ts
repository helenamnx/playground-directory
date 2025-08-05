import { Group } from '@/modules/groups/schemas/group.schema';
import { Role } from '@/shared/interfaces/keycloak-responses.interface';
import { Thing } from '@/shared/schemas/thing.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DocumentFolder extends Thing {
    @Prop({ required: true })
    name: string;

    @Prop({ type: String, ref: 'DocumentFolder', default: null })
    parent: DocumentFolder;

    @Prop({ type: [{ type: String, ref: 'UserRole' }], default: [] })
    allowedRoles: Role[];

    @Prop({ type: [{ type: String, ref: 'Group' }], default: [] })
    allowedGroups: Group[];

    // @Prop({ required: true, unique: true })
    // slug: string;
}

export const DocumentFolderSchema = SchemaFactory.createForClass(DocumentFolder);