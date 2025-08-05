import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserModerationHistoryService } from './user-moderation-history.service';
import { CreateUserModerationHistoryDto } from './dto/create-user-moderation-history.dto';
import { UpdateUserModerationHistoryDto } from './dto/update-user-moderation-history.dto';

@Controller('user-moderation-history')
export class UserModerationHistoryController {
  constructor(
    private readonly userModerationHistoryService: UserModerationHistoryService,
  ) {}
}
