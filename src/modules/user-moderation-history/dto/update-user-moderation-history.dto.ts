import { PartialType } from '@nestjs/mapped-types';
import { CreateUserModerationHistoryDto } from './create-user-moderation-history.dto';

export class UpdateUserModerationHistoryDto extends PartialType(CreateUserModerationHistoryDto) {}
