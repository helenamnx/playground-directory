import { Injectable } from '@nestjs/common';
import { CreateUserModerationHistoryDto } from './dto/create-user-moderation-history.dto';
import { UpdateUserModerationHistoryDto } from './dto/update-user-moderation-history.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { UserModerationHistory } from './schemas/user-moderation-history.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModerationStatusService } from '../moderation-status/moderation-status.service';
import { transform } from '@swc/core';
import { transformToLanguageMapType } from '@/shared/utils/utils';
@Injectable()
export class UserModerationHistoryService extends CRUDService<UserModerationHistory> {
  constructor(
    @InjectModel(UserModerationHistory.name)
    private userModerationHistoryModel: Model<UserModerationHistory>,
    private readonly moderationStatusService: ModerationStatusService,
  ) {
    super(userModerationHistoryModel);
  }

  async createUserModerationHistory(
    createUserModerationHistoryDto: CreateUserModerationHistoryDto,
  ) {
    const startTime = new Date();
    try {
      const { observation } = createUserModerationHistoryDto;
      const storedModerationStatus = await this.moderationStatusService.findOne(
        {
          filterOptions: {
            alias: createUserModerationHistoryDto.moderationStatusAlias,
          },
        },
      );
      const newUserModerationHistory = await super.create({
        ...createUserModerationHistoryDto,
        moderationStatus: storedModerationStatus._id,
        observation: observation
          ? transformToLanguageMapType(observation)
          : null,
      });
      //TODO: add history
      return newUserModerationHistory;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
