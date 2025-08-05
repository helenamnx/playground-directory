import { Injectable } from '@nestjs/common';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { ModerationStatus } from './schemas/moderation-status.schema';
import { Model } from 'mongoose';
import { CreateModerationStatusDto } from './dto/create-moderation-status.dto';
import { filterLanguageMap } from '@/shared/utils/filter-language-map.utils';
@Injectable()
export class ModerationStatusService extends CRUDService<ModerationStatus> {
  constructor(
    @InjectModel(ModerationStatus.name)
    private moderationStatusModel: Model<ModerationStatus>,
  ) {
    super(moderationStatusModel);
  }

  async createModerationStatus(
    createModerationStatusDto: CreateModerationStatusDto,
  ) {
    const startTime = new Date();
    try {
      //TODO: check if the status has at least one defaultLanguage from the client
      const newModerationStatus = await super.create(createModerationStatusDto);
      //TODO: add history
      return newModerationStatus;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async findAllModerationStatus(params?: {
    filterOptions?: any;
    paginationParams?: any;
    lang?: string;
  }) {
    const { filterOptions, paginationParams, lang } = params || {};
    const allModerationStatus = await super.findAll(
      {
        selectOptions: ['-history'],
      },
      paginationParams,
    );

    if (lang) {
      return allModerationStatus.map((item) =>
        filterLanguageMap(item.toJSON(), lang),
      );
    }

    return allModerationStatus;
  }

  async countDocuments() {
    return this.moderationStatusModel.countDocuments();
  }
}
