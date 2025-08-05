import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { Roles } from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { UsersMigrationService } from './users-migration.service';
import { OldUser } from '@/shared/interfaces/old-database-users.interface';
import { QuestionSeedService } from './question.seed.service';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { CategorySeedService } from './category-seed.service';

@Controller('migration')
export class MigrationController {
  constructor(
    private readonly usersMigrationService: UsersMigrationService,
    private readonly questionsMigrationService: QuestionSeedService,
    private readonly categoriesSeedService: CategorySeedService,
  ) {}

  @Roles([RolesEnum.ADMINISTRATOR])
  @UseGuards(UserTokenGuard)
  @Post('users')
  async migrateUsers(@Body() users: OldUser[]) {
    if (!users || users.length === 0) {
      throw new BadRequestCustomResponse({
        title: 'Users array is empty',
        key: CustomErrorKeys.VALIDATION_ERROR,
        detail: 'Users array is empty',
      });
    }
    await this.usersMigrationService.migrateUsers(users);

    return { message: 'Users migrated successfully' };
  }

  @Roles([RolesEnum.ADMINISTRATOR])
  @UseGuards(UserTokenGuard)
  @Post('questions')
  @UseInterceptors(FileInterceptor('file'))
  async migrateQuestions(@UploadedFile() file: File, @Body() params: any) {
    if (!params.sheetName) {
      throw new BadRequestCustomResponse({
        title: 'Missing sheet name',
        key: CustomErrorKeys.VALIDATION_ERROR,
        detail: 'Sheet name is required',
      });
    }

    await this.categoriesSeedService.migrateCategories({
      buffer: file.buffer,
      sheetName: params.sheetName,
    });

    const questionsCount =
      await this.questionsMigrationService.migrateQuestions({
        buffer: file.buffer,
        sheetName: params.sheetName,
      });

    return {
      message: 'Questions migrated successfully',
      newQuestions: questionsCount,
    };
  }
}
