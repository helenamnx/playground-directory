import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Action } from './schemas/action.schema';
import { Model } from 'mongoose';
import { CRUDService } from '@/config/database/CRUD/crud.service';

@Injectable()
export class ActionsService extends CRUDService<Action> {
  constructor(@InjectModel(Action.name) private actionModel: Model<Action>) {
    super(actionModel);
  }
}
