import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsArray } from "class-validator";

export class CreateDocumentFolderDto {

    @IsString()
    @IsNotEmpty()
    name: string;


    @IsOptional()
    parentFolderId?: string;


    @IsOptional()
    @IsArray()
    allowedRoles?: string[];


    @IsOptional()
    @IsArray()
    allowedGroups?: string[];

    // @IsString()
    // @IsNotEmpty()
    // slug: string;
}