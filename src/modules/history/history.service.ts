import { Injectable } from '@nestjs/common';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionsService } from '../actions/actions.service';
import { History } from './schemas/history.schema';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import {
  ActionAgentTypesEnum,
  ActionStatusEnum,
} from '@/shared/enums/action.enum';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { RequireAtLeastOne } from '@/shared/types/utils';

type CreateHistoryParams = RequireAtLeastOne<
  {
    entity?: any;
    actionType?: string;
  },
  'entity' | 'actionType'
>;

type ErrorHistoryParams = RequireAtLeastOne<
  {
    entity?: any;
    actionType?: string;
  },
  'entity' | 'actionType'
> & {
  errorMessage: string;
};

@Injectable()
export class HistoryService extends CRUDService<History> {
  constructor(
    private readonly actionsService: ActionsService,
    private readonly alsService: AsyncStorageService,
    @InjectModel(History.name) private historyModel: Model<History>,
  ) {
    super(historyModel);
  }

  private extractEntityData(entity: any) {
    const modelName = entity?.constructor?.modelName ?? 'System';
    const object = entity ? JSON.stringify(entity.toJSON?.() ?? entity) : null;
    return { modelName, object };
  }

  private async createHistoryInternal(params: {
    entity?: any;
    actionType: string;
    actionStatus: string;
    nextStatus?: string;
    errorMessage?: string;
  }) {
    const { entity, actionType, actionStatus, nextStatus, errorMessage } =
      params;

    const { modelName, object } = this.extractEntityData(entity);
    const user = this.alsService.get(AlsKeysEnum.APP_USER);
    const startTime = this.alsService.get(AlsKeysEnum.START_TIME);

    const newAction = await this.actionsService.create({
      actionType,
      actionStatus,
      agent: user?._id ?? null,
      agentType: user ? ActionAgentTypesEnum.USER : ActionAgentTypesEnum.SYSTEM,
      object,
      objectType: modelName,
      startTime,
      endTime: new Date(),
      ...(errorMessage ? { error: errorMessage } : {}),
    });

    const newHistory = await super.create({
      action: newAction._id,
      previousStatus: null,
      nextStatus,
    });

    if (entity?.history && typeof entity.save === 'function') {
      entity.history.push(newHistory._id);
      await entity.save();
    }

    return newHistory;
  }

  async createHistory(params: CreateHistoryParams) {
    const actionType =
      params.actionType ??
      `${ActionStatusEnum.CREATED.toLowerCase()}${params.entity.constructor.modelName}`;

    return this.createHistoryInternal({
      entity: params.entity,
      actionType,
      actionStatus: ActionStatusEnum.COMPLETED,
      nextStatus: ActionStatusEnum.CREATED,
    });
  }

  async updateHistory(params: CreateHistoryParams) {
    const actionType =
      params.actionType ??
      `${ActionStatusEnum.UPDATED.toLowerCase()}${params.entity.constructor.modelName}`;

    return this.createHistoryInternal({
      entity: params.entity,
      actionType,
      actionStatus: ActionStatusEnum.COMPLETED,
      nextStatus: ActionStatusEnum.UPDATED,
    });
  }

  async errorHistory(params: ErrorHistoryParams) {
    return this.createHistoryInternal({
      entity: params.entity,
      actionType: params.actionType,
      actionStatus: ActionStatusEnum.ERROR,
      errorMessage: params.errorMessage,
    });
  }
}
