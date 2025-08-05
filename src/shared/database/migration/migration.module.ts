import { Module } from '@nestjs/common';
import { SpreadsheetModule } from '@/shared/services/spreadsheet/spreadsheet.module';
import { CategorySeedService } from './category-seed.service';
import { CategoriesService } from '@/modules/categories/categories.service';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { QuestionsModule } from '@/modules/questions/questions.module';
import { InformationModule } from '@/modules/information/information.module';
import { AnswerOptionsModule } from '@/modules/answer-options/answer-options.module';
import { QuestionConfigurationsModule } from '@/modules/question-configurations/question-configurations.module';
import { QuestionSeedService } from './question.seed.service';
import { CategoryScopesModule } from '@/modules/category-scopes/category-scopes.module';
import { UsersMigrationService } from './users-migration.service';
import { AppUsersModule } from '@/modules/app-users/app-users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserRolesModule } from '@/modules/user-roles/user-roles.module';
import { ClientsModule } from '@/modules/clients/clients.module';
import { PlatformsModule } from '@/modules/platforms/platforms.module';
import { UsersModule } from '@/modules/users/users.module';
import { CountriesModule } from '@/modules/countries/countries.module';
import { LocalitiesModule } from '@/modules/localities/localities.module';
import { RegionsModule } from '@/modules/regions/regions.module';
import { MigrationController } from './migration.controller';

@Module({
  imports: [
    CountriesModule,
    LocalitiesModule,
    RegionsModule,
    UsersModule,
    PlatformsModule,
    UserRolesModule,
    ClientsModule,
    AppUsersModule,
    AuthModule,
    SpreadsheetModule,
    CategoriesModule,
    CategoryScopesModule,
    QuestionsModule,
    InformationModule,
    AnswerOptionsModule,
    QuestionConfigurationsModule,
  ],
  controllers: [MigrationController],
  providers: [
    CategorySeedService,
    CategoriesService,
    QuestionSeedService,
    UsersMigrationService,
  ],
  exports: [CategorySeedService, QuestionSeedService, UsersMigrationService],
})
export class MigrationModule {}
