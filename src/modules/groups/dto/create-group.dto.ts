import { CreateGroupConfigurationDto } from '@/modules/group-configurations/dto/create-group-configuration.dto';
import { LanguageMap } from '@/shared/types/language-map.type';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsObject()
  @IsNotEmpty()
  name: LanguageMap;

  @Type(() => CreateGroupConfigurationDto)
  @IsOptional()
  configuration?: CreateGroupConfigurationDto;
}

export class CreateGroupControllerDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsNotEmpty()
  name: LanguageMap;
}
