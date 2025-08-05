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
} from '@nestjs/common';
import { ExamAttemptsService } from './exam-attempts.service';
import {
  CreateExamAttemptControllerDto,
  CreateExamAttemptDto,
} from './dto/create-exam-attempt.dto';
import {
  UpdateExamAttemptControllerDto,
  UpdateExamAttemptDto,
} from './dto/update-exam-attempt.dto';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { UpdateExamAttemptQuestionControllerNewDto } from './dto/update-exam-attempt-question.dto';
import {
  Resource,
  Roles,
  UserScope,
} from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import resourcesJson from '@/shared/json/resources.json';
import scopesJson from '@/shared/json/scopes.json';
import {
  GenerateExamAttemptControllerDto,
  GenerateExamAttemptDto,
} from './dto/generate-exam-attempt.dto';
import { plainToInstance } from 'class-transformer';
import { ExamResponseDto } from './dto/get-exam-attempt.response.dto';

@Controller('exam-attempts')
export class ExamAttemptsController {
  constructor(
    private readonly examAttemptsService: ExamAttemptsService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:exam-attempts:create'])
  @UseGuards(UserTokenGuard)
  @Post()
  generateExamAttempt(
    @Body() createExamAttemptDto: GenerateExamAttemptControllerDto,
  ) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const appUser = this.alsService.get(AlsKeysEnum.APP_USER);
    return this.examAttemptsService.createExamAttempt({
      ...createExamAttemptDto,
      appUser: appUser._id,
      language:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  // @Roles([RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:exam-attempts:update-own-attempt'])
  @UseGuards(UserTokenGuard)
  @Patch()
  updateExamAttempt(
    @Body() updateExamAttemptDto: UpdateExamAttemptControllerDto,
  ) {
    return this.examAttemptsService.updateExamAttempt({
      ...updateExamAttemptDto,
      appUserId: this.alsService.get(AlsKeysEnum.APP_USER)._id,
    });
  }

  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:exam-attempts:update-own-attempt'])
  @UseGuards(UserTokenGuard)
  @Patch('answers')
  updateExamAttemptQuestion(
    @Body()
    updateExamAttemptAnswerControllerDto: UpdateExamAttemptQuestionControllerNewDto,
  ) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.examAttemptsService.updateExamAttemptQuestion(
      {
        ...updateExamAttemptAnswerControllerDto,
        appUserId: this.alsService.get(AlsKeysEnum.APP_USER)._id,
      },
      filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }

  // @Roles([RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:exam-attempts:view-own-attempt'])
  @UseGuards(UserTokenGuard)
  @Get()
  findAllMyExams() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.examAttemptsService.findAllMyExams({
      appUser: this.alsService.get(AlsKeysEnum.APP_USER),
      filterOptions: filterOptions,
      paginationParams: this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS),
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  // @Roles([RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:exam-attempts:history:view-own-history'])
  @UseGuards(UserTokenGuard)
  @Get('history')
  findExamHistory() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.examAttemptsService.findExamHistory({
      appUser: this.alsService.get(AlsKeysEnum.APP_USER),
      filterOptions: filterOptions,
      paginationParams: this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS),
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  // @Roles([RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Exams)
  @UserScope(scopesJson['exam:exam-attempts:view-own-attempt'])
  @UseGuards(UserTokenGuard)
  @Get(':id')
  async findOneExamAttempt(@Param('id') id: string) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const examAttempt = await this.examAttemptsService.findOneById(
      id,
      this.alsService.get(AlsKeysEnum.APP_USER)._id,
      filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
    return plainToInstance(ExamResponseDto, examAttempt, {
      excludeExtraneousValues: true,
    });
  }
}
