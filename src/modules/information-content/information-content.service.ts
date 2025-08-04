import { Injectable } from '@nestjs/common';
import { CreateInformationContentDto } from './dto/create-information-content.dto';
import { UpdateInformationContentDto } from './dto/update-information-content.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CRUDService } from 'src/config/database/CRUD/crud.service';
import { InformationContent } from './schema/information-content.schema';
import { Model } from 'mongoose';
@Injectable()
export class InformationContentService extends CRUDService<InformationContent> {
  constructor(
    @InjectModel(InformationContent.name)
    private readonly informationContentModel: Model<InformationContent>,
  ) {
    super(informationContentModel);
  }

  async create(createInformationContentDto: CreateInformationContentDto) {
    const newInformationContent = await super.create(
      createInformationContentDto,
    );
    return newInformationContent;
  }

  async findAll() {
    const informationContent = await super.findAll({
      populateOptions: [
        {
          path: 'information',
          select: ['name', '_id'],
        },
      ],
    });
    return informationContent;
  }

  async findOneInformationContent(id: string) {
    const informationContent = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: [
        {
          path: 'information',
          select: ['name', '_id'],
        },
      ],
    });
    return informationContent;
  }

  async updateInformationContent(
    id: string,
    updateInformationContentDto: UpdateInformationContentDto,
  ) {
    const updatedInformationContent = await super.update(
      id,
      updateInformationContentDto,
    );
    return updatedInformationContent;
  }
}
