import { IsString, IsNotEmpty, IsUrl, IsMongoId, IsOptional, IsBoolean, IsObject, IsArray } from "class-validator";

export class CreatePdfDocumentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

 
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    contentUrl: string;

   
    @IsMongoId()
    @IsNotEmpty()
    parentFolderId: string;

    
    @IsMongoId()
    @IsNotEmpty()
    creator: string;


    @IsOptional()
    @IsMongoId()
    versionSeries?: string;

    @IsOptional()
    @IsBoolean()
    isLatestVersion?: boolean;

    @IsOptional()
    @IsObject()
    annotations?: object;


    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    allowedRoles?: string[];

   
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    allowedGroups?: string[];


    @IsString()
    @IsNotEmpty()
    slug: string;


    @IsOptional()
    @IsString()
    indexedContent?: string;
}
