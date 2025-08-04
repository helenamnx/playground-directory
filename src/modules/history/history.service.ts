import { Injectable } from '@nestjs/common';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionsService } from '../actions/actions.service';
import { History } from './schemas/history.schema';
import { AsyncStorageService } from '@/shared/services/als/als.service';

@Injectable()
export class HistoryService extends CRUDService<History> {
  constructor(
    private readonly actionsService: ActionsService,
    private readonly alsService: AsyncStorageService,
    @InjectModel(History.name) private historyModel: Model<History>,
  ) {
    super(historyModel);
  }

  //TODO: you have to unroll a history without async storage or implement conditionals for actions performed by the system.
  //TODO: add validations
  async createHistoryRecord(params: {
    entity: any;
    actionType?: string;
    actionStatus: string;
    nextStatus: string;
    errorMessage?: string;
  }) {

    const { entity, actionType, actionStatus, nextStatus, errorMessage } =
      params;
    const store = this.alsService.getStore();

    const appUser = store.get('appUser');

    const startTime = store.get('startTime');

    const newAction = await this.actionsService.create({
      actionType:
        actionType ||
        `${nextStatus.toLowerCase()}${entity.constructor.modelName}`,
      actionStatus,
      agent: appUser?._id || null,
      agentType: appUser ? 'AppUser' : 'System',
      object: entity?._id || null,
      objectType: entity.constructor.modelName,
      startTime,
      endTime: new Date(),
      ...(errorMessage ? { error: errorMessage } : {}), // Solo agrega error si existe
    });

    const newHistory = await super.create({
      action: newAction._id,
      previousStatus: null, // TODO: manejar el previousStatus correctamente
      nextStatus,
    });

    if (entity) {
      entity.history.push(newHistory._id);
      await entity.save();
    }

    return newHistory;
  }

  async createHistory(entity: any, actionType?: string) {
    return this.createHistoryRecord({
      entity: entity,
      actionType: actionType,
      actionStatus: 'CompletedActionStatus', //TODO: change
      nextStatus: 'Created',
    });
  }

  async updateHistory(entity: any, actionType?: string) {
    return this.createHistoryRecord({
      entity: entity,
      actionType: actionType,
      actionStatus: 'UpdatedStatus', //TODO: change
      nextStatus: 'Updated',
    });
  }

  async errorHistory(params: {
    errorMessage: string;
    entity?: any;
    actionType?: string;
  }) {
    return this.createHistoryRecord({
      entity: params.entity,
      actionType: params.actionType,
      actionStatus: 'FailedActionStatus',
      nextStatus: null,
      errorMessage: params.errorMessage,
    });
  }
}
