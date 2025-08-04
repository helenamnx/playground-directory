import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformDto } from './create-platform.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlatformDto extends PartialType(CreatePlatformDto) {
  @IsNotEmpty()
  @IsString()
  _id: string;
}
