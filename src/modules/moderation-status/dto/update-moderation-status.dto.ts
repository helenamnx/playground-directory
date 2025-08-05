import { PartialType } from '@nestjs/mapped-types';
import { CreateModerationStatusDto } from './create-moderation-status.dto';

export class UpdateModerationStatusDto extends PartialType(CreateModerationStatusDto) {}
