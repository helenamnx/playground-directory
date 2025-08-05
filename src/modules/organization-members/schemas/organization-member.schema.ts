import { AppUser } from "@/modules/app-users/schemas/app-user.schema";
import { Organization } from "@/modules/organizations/schemas/organization.schema";
import { Thing } from "@/shared/schemas/thing.schema";
import { Prop, SchemaFactory } from "@nestjs/mongoose";

export class OrganizationMember extends Thing {
    @Prop({ type: String, ref: 'AppUser', required: true })
    appUser: AppUser;

    @Prop({
        required: false,
        type: String,
        ref: 'Organization',
    })
    organization: Organization;
}
export const OrganizationMemberSchema =
    SchemaFactory.createForClass(OrganizationMember);