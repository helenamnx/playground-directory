import { Injectable } from '@nestjs/common';
import { CreateActionSpecificationDto } from './dto/create-action-specification.dto';
import { UpdateActionSpecificationDto } from './dto/update-action-specification.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { ActionSpecification } from './schemas/action-specification.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class ActionSpecificationsService extends CRUDService<ActionSpecification> {
  constructor(
    @InjectModel(ActionSpecification.name)
    private actionSpecificationModel: Model<ActionSpecification>,
  ) {
    super(actionSpecificationModel);
  }
  async createActionSpecifications(
    createActionSpecificationsDto: CreateActionSpecificationDto[],
  ): Promise<ActionSpecification[]> {
    const createdActionSpecifications = await Promise.all(
      createActionSpecificationsDto.map((dto) => super.create(dto)),
    );
    return createdActionSpecifications;
  }

  async findManyByIds(ids: string[]): Promise<ActionSpecification[]> {
    const actionSpecifications = await super.findAll({
      filterOptions: { _id: { $in: ids } }, // Filter by the provided IDs
    });
    return actionSpecifications;
  }
}
