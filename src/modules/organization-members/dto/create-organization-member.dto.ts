import { AppUser } from "@/modules/app-users/schemas/app-user.schema";
import { Organization } from "@/modules/organizations/schemas/organization.schema";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateOrganizationMemberDto {
    @IsString()
    @IsNotEmpty()
    user: AppUser['_id'];

    @IsString()
    @IsNotEmpty()
    organization: Organization['_id'];
}
