import { PartialType } from '@nestjs/mapped-types';
import { CreateActionSpecificationDto } from './create-action-specification.dto';

export class UpdateActionSpecificationDto extends PartialType(CreateActionSpecificationDto) {}
