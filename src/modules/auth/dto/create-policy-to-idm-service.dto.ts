import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreatePolicyToIDMServiceDto {
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
  roles: any[];

  @IsString()
  @IsNotEmpty()
  logic: string;

  @IsString()
  @IsNotEmpty()
  decisionStrategy: string;
}
