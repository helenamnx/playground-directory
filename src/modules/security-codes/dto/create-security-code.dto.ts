import {
  SecurityCodeStatus,
  SecurityCodeTypes,
} from '@/shared/enums/securityCode.enum';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSecurityCodeDto {
  @IsNotEmpty()
  @IsString()
  user: string; //Id of the user

  @IsNotEmpty()
  @IsEnum(SecurityCodeStatus)
  status: SecurityCodeStatus;

  @IsNotEmpty()
  @IsEnum(SecurityCodeTypes)
  type: SecurityCodeTypes;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expireDate: Date;
}
