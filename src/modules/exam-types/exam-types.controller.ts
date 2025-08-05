import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExamTypesService } from './exam-types.service';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';
import { Roles } from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { AppUser } from '../app-users/schemas/app-user.schema';

@Controller('exam-types')
export class ExamTypesController {
  constructor(
    private readonly examTypesService: ExamTypesService,
    private readonly alsService: AsyncStorageService,
  ) {}

  @Roles([RolesEnum.ADMINISTRATOR])
  @UseGuards(UserTokenGuard)
  @Post()
  create(@Body() createExamTypeDto: CreateExamTypeDto) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.examTypesService.createExamType(
      createExamTypeDto,
      filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }

  @UseGuards(UserTokenGuard)
  @Get()
  findAllExamTypes() {
    const appUser: AppUser = this.alsService.get(AlsKeysEnum.APP_USER);
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const paginationParams = this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS);
    return this.examTypesService.findAllExamTypes({
      appUser: appUser,
      filterOptions: filterOptions,
      paginationParams: paginationParams,
      lang:
        filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  @Get(':id')
  findOneExamType(@Param('id') id: string) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    return this.examTypesService.findOneByID(
      id,
      filterOptions.lang || this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    );
  }
}
