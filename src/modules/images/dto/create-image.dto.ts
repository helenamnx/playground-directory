import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ImageTypeEnum } from '../enums/type-image.enum';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  alt: string;

  // @IsEnum(ImageTypeEnum)
  @IsOptional()
  imageType?: string;

  //   @IsString({ each: true })
  //   @IsNotEmpty()
  //   tags: Tag["_id"][];
}
