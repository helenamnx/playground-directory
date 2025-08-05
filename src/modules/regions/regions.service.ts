import { Injectable } from '@nestjs/common';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Region } from './schemas/region.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RegionsService extends CRUDService<Region> {
  constructor(@InjectModel(Region.name) private regionModel: Model<Region>) {
    super(regionModel);
  }
}
