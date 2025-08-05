import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreatePermissionToIDMServiceDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  @IsNotEmpty()
  resources: string[];

  // @IsArray()
  // @IsNotEmpty()
  // scopes: string[];

  @IsArray()
  @IsNotEmpty()
  policies: string[];

  @IsString()
  @IsNotEmpty()
  decisionStrategy: string;

  @IsString()
  @IsNotEmpty()
  logic: string;
}
