import { PartialType } from '@nestjs/mapped-types';
import { CreateSecurityCodeDto } from './create-security-code.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSecurityCodeDto extends PartialType(CreateSecurityCodeDto) {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
