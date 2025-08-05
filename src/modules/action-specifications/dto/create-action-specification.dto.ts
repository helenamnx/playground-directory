import { ApiMethodEnum } from '@/shared/enums/api-method.enum';
import {
  IsString,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export class CreateActionSpecificationDto {
  /**
   * HTTP method (e.g., GET, POST, PUT, DELETE).
   */
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsEnum(ApiMethodEnum)
  method?: string;

  /**
   * URL of the external service.
   */
  @IsNotEmpty()
  @IsString()
  endpointPath: string;

  /**
   * Optional parameters for the action.
   */
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}
