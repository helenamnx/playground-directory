import { PartialType } from '@nestjs/mapped-types';
import { CreateInformationContentDto } from './create-information-content.dto';

export class UpdateInformationContentDto extends PartialType(CreateInformationContentDto) {}
