import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { KeyValue } from '@/shared/schemas/key-value.schema';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateAppUserDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  gender?: string;


  @Type(() => CreateUserDto)
  @IsNotEmpty()
  user: CreateUserDto;
}
