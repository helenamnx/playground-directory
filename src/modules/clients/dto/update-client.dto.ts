import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsString()
  @IsOptional()
  _id: string;
}
