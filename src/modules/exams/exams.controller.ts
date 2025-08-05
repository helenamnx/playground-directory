import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import resourcesJson from '@/shared/json/resources.json';
import scopesJson from '@/shared/json/scopes.json';
import {
  Resource,
  Roles,
  UserScope,
} from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { UpdateExamDto } from './dto/update-exam.dto';
import { UpdateExamConfigurationDto } from '../exam-configurations/dto/update-exam-configuration.dto';
import { ExamConfigurationsService } from '../exam-configurations/exam-configurations.service';
import { UpdateExamVersionDto } from './dto/update-exam-version.dto';
import { Client } from '../clients/schemas/client.schema';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly examConfigurationsService: ExamConfigurationsService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Roles([RolesEnum.ADMINISTRATOR])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:create'])
  @UseGuards(UserTokenGuard)
  @Post()
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.createExam({
      ...createExamDto,
      information: {
        ...createExamDto.information,
        author: this.alsService.get(AlsKeysEnum.APP_USER).user.username,
        content: {
          ...createExamDto.information.content,
          language: this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
        },
      },
    });
  }

  @Roles([RolesEnum.ADMINISTRATOR, RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:view-all'])
  @UseGuards(UserTokenGuard)
  @Get()
  findAllExams() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const paginationParams = this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS);
    return this.examsService.findAllExams({
      filterOptions: filterOptions,
      paginationParams: paginationParams,
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  @Roles([RolesEnum.ADMINISTRATOR, RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:view-all'])
  @UseGuards(UserTokenGuard)
  @Get(':id')
  findOneExam(@Param('id') id: string) {
    return this.examsService.findOneById(
      id,
      this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }

  @Roles([RolesEnum.ADMINISTRATOR, RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Questions)
  @UserScope(scopesJson['questions:view-all'])
  @UseGuards(UserTokenGuard)
  @Get(':id/questions')
  getExamQuestions(
    @Param('id') id: string,
    @Query('availableQuestions') availableQuestions: boolean,
  ) {
    {
      return this.examsService.getExamQuestions({
        id,
        lang: this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
        availableQuestions,
      });
    }
  }

  @Roles([RolesEnum.ADMINISTRATOR])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:update'])
  @UseGuards(UserTokenGuard)
  @Put()
  async updateExamVersion(
    @Body() updateExamVersionDto: UpdateExamVersionDto,
    @Query('update-version') updateVersion: boolean,
  ) {
    const appUser = this.alsService.get(AlsKeysEnum.APP_USER);
    const client: Client = this.alsService.get(AlsKeysEnum.CLIENT);
    const language =
      client.configuration?.defaultLanguage ||
      this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE);
    let dto = updateExamVersionDto;
    //if information is provided, create the information payload
    if (dto.information) {
      dto.information = {
        ...updateExamVersionDto.information,
        author: this.alsService.get(AlsKeysEnum.APP_USER).user.username,
        content: {
          ...updateExamVersionDto.information.content,
          language: language,
        },
      };
    }
    //if the update version is false, check if the exam has attempts
    //if it has attempts, return a message
    let updated = false;
    if (!updateVersion) {
      const hasAttempts = await this.examsService.checkIfExamHasAttempts(
        updateExamVersionDto._id,
      );
      if (hasAttempts) {
        throw new BadRequestCustomResponse({
          title: 'Examen ya tiene intentos',
          key: CustomErrorKeys.EXAM_HAS_ATTEMPTS,
          detail: 'El examen ya tiene intentos',
        });
      }
      await this.examsService.updateExam(updateExamVersionDto);
      updated = true;
    }
    if (updated) {
      return { message: 'El examen se actualizó correctamente' };
    }
    return this.examsService.updateExamVersion(
      updateExamVersionDto,
      language,
      appUser,
    );
  }

  @Roles([RolesEnum.ADMINISTRATOR])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:update'])
  @UseGuards(UserTokenGuard)
  @Patch('exam-configurations')
  async updateExamConfiguration(
    @Body() updateExamConfigurationDto: UpdateExamConfigurationDto,
  ) {
    await this.examConfigurationsService.updateExamConfiguration(
      updateExamConfigurationDto,
    );

    return { message: 'Exam configuration updated successfully' };
  }
}
