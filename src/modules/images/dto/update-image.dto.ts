import { PartialType } from "@nestjs/mapped-types";
import { CreateImageDto } from "./create-image.dto";
import { IsOptional, IsString, IsNotEmpty } from "class-validator";
import { ImageTypeEnum } from "../enums/type-image.enum";

export class UpdateImageDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  imageType?: ImageTypeEnum;

//   @IsOptional()
//   @IsString()
//   tags?: Tag["_id"][];
}
