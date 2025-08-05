import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryScopeDto } from './create-category-scope.dto';

export class UpdateCategoryScopeDto extends PartialType(CreateCategoryScopeDto) {}
