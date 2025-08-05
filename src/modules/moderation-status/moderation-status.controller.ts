import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ModerationStatusService } from './moderation-status.service';
import { CreateModerationStatusDto } from './dto/create-moderation-status.dto';
import { UpdateModerationStatusDto } from './dto/update-moderation-status.dto';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';

@Controller('moderation-status')
export class ModerationStatusController {
  constructor(
    private readonly moderationStatusService: ModerationStatusService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Get()
  async getAllModerationStatus() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const paginationParams = this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS);
    return this.moderationStatusService.findAllModerationStatus({
      filterOptions: filterOptions,
      paginationParams: paginationParams,
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }
}
