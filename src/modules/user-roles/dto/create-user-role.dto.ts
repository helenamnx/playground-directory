import { Service } from '@/modules/services/schemas/service.schema';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../schemas/user-role.schemas';
import { LanguageMapType } from '@/shared/types/language-map.type';

export class CreateUserRoleDto {
  @IsString()
  @IsOptional()
  _id: string;

  @IsNotEmpty()
  name: LanguageMapType;

  @IsNotEmpty()
  description: LanguageMapType;

  @IsString()
  @IsNotEmpty()
  serviceId: Service['_id'];

  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsString()
  @IsNotEmpty()
  externalId: string;

  @IsArray()
  @IsOptional()
  parents: UserRole['_id'][];

  @IsArray()
  @IsOptional()
  permissions: UserRole['_id'][];
}
