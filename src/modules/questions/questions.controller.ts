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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { Roles } from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import resourcesJson from '@/shared/json/resources.json';
import scopesJson from '@/shared/json/scopes.json';
import { Resource, UserScope } from '@/shared/decorators/user-scopes.decorator';
import { UpdateQuestionVersionDto } from './dto/update-question-version.dto';
import { Client } from '../clients/schemas/client.schema';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Roles([RolesEnum.ADMINISTRATOR])
  @Resource(resourcesJson.Questions)
  @UserScope(scopesJson['questions:create'])
  @UseGuards(UserTokenGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.createQuestion({
      ...createQuestionDto,
      information: {
        ...createQuestionDto.information,
        author: this.alsService.get(AlsKeysEnum.APP_USER).user.username,
        content: {
          ...createQuestionDto.information.content,
          language: this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
        },
      },
    });
  }

  // @Roles([RolesEnum.ADMINISTRATOR])
  // @Resource(resourcesJson.Questions)
  // @UserScope(scopesJson['questions:create'])
  @UseGuards(UserTokenGuard)
  @Put('update-version')
  updateQuestionVersion(
    @Body() updateQuestionVersionDto: UpdateQuestionVersionDto,
  ) {
    const appUser = this.alsService.get(AlsKeysEnum.APP_USER);
    const client: Client = this.alsService.get(AlsKeysEnum.CLIENT);
    const language =
      client.configuration?.defaultLanguage ||
      this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE);
    let dto = updateQuestionVersionDto;
    //if information is provided, create the information payload
    if (dto.information) {
      dto.information = {
        ...updateQuestionVersionDto.information,
        author: this.alsService.get(AlsKeysEnum.APP_USER).user.username,
        content: {
          ...updateQuestionVersionDto.information.content,
          language: language,
        },
      };
    }
    return this.questionsService.updateQuestionVersion(
      updateQuestionVersionDto,
      language,
      appUser,
    );
  }

  @Roles([RolesEnum.ADMINISTRATOR, RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Questions)
  @UserScope(scopesJson['questions:view-all'])
  @UseGuards(UserTokenGuard)
  @Get()
  findAllQuestions() {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);

    return this.questionsService.findAllQuestions({
      filterOptions: filterOptions,
      paginationParams: this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS),
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  @Roles([RolesEnum.ADMINISTRATOR, RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Questions)
  @UserScope(scopesJson['questions:view-all'])
  @UseGuards(UserTokenGuard)
  @Get(':id')
  findOneQuestion(@Param('id') id: string) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.questionsService.findOneById({
      id,
      lang: filterOptions.lang
        ? filterOptions.lang
        : this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }
}
