import { CRUDService } from '@/config/database/CRUD/crud.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateInformationDto } from './dto/create-information.dto';
import { Information } from './schema/information.schema';
import { Model } from 'mongoose';
import { InformationContentService } from '../information-content/information-content.service';
import { UpdateInformationDto } from './dto/update-information.dto';
import { HistoryService } from '../history/history.service';

@Injectable()
export class InformationService extends CRUDService<Information> {
  constructor(
    @InjectModel(Information.name)
    private readonly informationModel: Model<Information>,
    private readonly informationContentService: InformationContentService,
    private readonly historyService: HistoryService,
  ) {
    super(informationModel);
  }

  async create(createInformationDto: CreateInformationDto) {
    try {
      const newContent = await this.informationContentService.create(
        createInformationDto.content,
      );
      const newInformation = await super.create({
        ...createInformationDto,
        content: newContent,
      });
      //TODO: add history
      //create history
      const newHistory = await this.historyService.createHistoryRecord({
        entity: newInformation,
        actionType: 'create',
        actionStatus: 'success',
        nextStatus: 'created',
      });

      return newInformation;
    } catch (error) {
      //TODO: add history
      //create history
      const errorHistory = await this.historyService.createHistoryRecord({
        entity: null,
        actionType: 'create',
        actionStatus: 'error',
        nextStatus: 'error',
        errorMessage: error.message,
      });
      console.log(
        '🚀 ~ InformationService ~ create ~ errorHistory:',
        errorHistory,
      );
      throw error;
    }
  }

  async findAll() {
    const information = await super.findAll({
      populateOptions: [
        {
          path: 'content',
          select: ['title', 'subtitle', 'body', 'slug'],
        },
      ],
    });
    return information;
  }

  async findOneInformation(id: string) {
    const information = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: [
        {
          path: 'content',
          select: ['title', 'subtitle', 'body', 'slug'],
        },
      ],
    });
    return information;
  }

  async updateInformation(
    id: string,
    updateInformationDto: UpdateInformationDto,
  ) {
    //find the information  populated with content
    const information = await super.findOne({
      filterOptions: {
        _id: id,
      },
      populateOptions: ['content'],
    });

    if (!information) {
      throw new Error('Information not found');
    }
    //find the content
    const content = await this.informationContentService.findOne({
      filterOptions: {
        _id: information.content._id,
      },
    });
    //Update the content
    const updatedContent = await this.informationContentService.update(
      content._id,
      updateInformationDto.content,
    );
    //Update the information
    const updatedInformation = await super.update(id, {
      ...updateInformationDto,
      content: updatedContent,
    });
    return updatedInformation;
  }
}
