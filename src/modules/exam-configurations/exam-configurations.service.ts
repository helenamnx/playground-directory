import { Injectable } from '@nestjs/common';
import { CreateExamConfigurationDto } from './dto/create-exam-configuration.dto';
import { UpdateExamConfigurationDto } from './dto/update-exam-configuration.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { ExamConfiguration } from './schemas/exam-configuration.schema';
import { Model } from 'mongoose';
import { GroupsService } from '../groups/groups.service';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
@Injectable()
export class ExamConfigurationsService extends CRUDService<ExamConfiguration> {
  constructor(
    @InjectModel(ExamConfiguration.name)
    private examConfigurationModel: Model<ExamConfiguration>,
    private readonly groupsService: GroupsService,
  ) {
    super(examConfigurationModel);
  }

  async createExamConfiguration(
    createExamConfigurationDto: CreateExamConfigurationDto,
  ) {
    try {
      //if groups is provided, check if they exist
      if (createExamConfigurationDto.groups) {
        await Promise.all(
          createExamConfigurationDto.groups.map(async (group) => {
            await this.groupsService.findOne({
              filterOptions: {
                _id: group,
              },
            });
          }),
        );
      }
      const newExamConfiguration = await super.create(
        createExamConfigurationDto,
      );
      return newExamConfiguration;
    } catch (error) {
      throw error;
    }
  }

  async updateExamConfiguration(
    updateExamConfigurationDto: UpdateExamConfigurationDto,
  ): Promise<ExamConfiguration> {
    try {
      const { groups } = updateExamConfigurationDto;
      //first, check if the exam configuration exists
      const storedExamConfiguration = await super.findOne({
        filterOptions: {
          _id: updateExamConfigurationDto._id,
        },
      });
      //if group is provided, check if they exist
      //then, push the groups to the exam configuration
      if (groups) {
        const groupIds = await Promise.all(
          groups.map(async (group) => {
            const storedGroup = await this.groupsService.findOne({
              filterOptions: {
                _id: group,
              },
              populateOptions: ['configuration'],
            });
            if (!storedGroup.configuration.isActive) {
              throw new BadRequestCustomResponse({
                title: 'Group is not active',
                key: CustomErrorKeys.GROUP_IS_NOT_ACTIVE,
                detail: 'Group is not active',
              });
            }
            return storedGroup._id;
          }),
        );
      }
      //then, update it
      const updatedExamConfiguration = await super.update(
        storedExamConfiguration._id,
        updateExamConfigurationDto,
      );
      return updatedExamConfiguration;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
