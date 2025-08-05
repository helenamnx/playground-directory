import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateClientRoleDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  composite: boolean;

  @IsBoolean()
  @IsNotEmpty()
  clientRole: boolean;
}
