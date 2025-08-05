import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateResourceToIDMServiceDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsArray()
  @IsNotEmpty()
  uris: string[];

  @IsArray()
  @IsNotEmpty()
  scopes: { name: string }[];

  @IsString()
  @IsNotEmpty()
  ownerManagedAccess: boolean;
}
