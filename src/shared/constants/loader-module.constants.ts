import { CacheConfigModule } from 'src/config/cache/cache.module';
import { AppConfigModule } from 'src/config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { IdempotencyKeysModule } from 'src/idempotency-keys/idempotency-keys.module';
import { RedisModule } from '../services/redis/redis.module';
import { UsersModule } from 'src/modules/users/users.module';
import { UserConfigurationsModule } from 'src/modules/user-configurations/user-configurations.module';
import { DatabaseConfigModule } from 'src/config/database/database.module';
import { HistoryModule } from '@/modules/history/history.module';
import { ActionsModule } from '@/modules/actions/actions.module';
import { AsyncStorageModule } from '../services/als/als.module';
import { AppUsersModule } from '@/modules/app-users/app-users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PlatformsModule } from '@/modules/platforms/platforms.module';
import { PlatformConfigurationsModule } from '@/modules/platform-configurations/platform-configurations.module';
import { ClientsModule } from '@/modules/clients/clients.module';
import { ServicesModule } from '@/modules/services/services.module';
import { SubscriptionsModule } from '@/modules/subscriptions/subscriptions.module';
import { HealthModule } from '@/config/health/health.module';
import { EmailsModule } from '@/modules/emails/emails.module';
import { InformationModule } from '@/modules/information/information.module';
import { InformationContentModule } from '@/modules/information-content/information-content.module';
import { EntitiesModule } from '../services/entities/entities.module';
import { AppSeedModule } from '../database/seed/seed.module';
import { ActionSpecificationsModule } from '@/modules/action-specifications/action-specifications.module';
import { AnswerOptionsModule } from '@/modules/answer-options/answer-options.module';
import { ExamConfigurationsModule } from '@/modules/exam-configurations/exam-configurations.module';
import { ExamRulesModule } from '@/modules/exam-rules/exam-rules.module';
import { ExamsModule } from '@/modules/exams/exams.module';
import { QuestionsModule } from '@/modules/questions/questions.module';
import { TagsModule } from '@/tags/tags.module';

import { QuestionConfigurationsModule } from '@/modules/question-configurations/question-configurations.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { MigrationModule } from '../database/migration/migration.module';
import { ContactPointsModule } from '@/modules/contact-points/contact-points.module';
import { OrganizationMembersModule } from '@/modules/organization-members/organization-members.module';
import { OrganizationsModule } from '@/modules/organizations/organizations.module';
import { PostalAddressesModule } from '@/modules/postal-addresses/postal-addresses.module';
import { JsonFetcherModule } from '../services/json-fetcher/json-fetcher.module';
import { ModerationStatusModule } from '@/modules/moderation-status/moderation-status.module';
import { UserRolesModule } from '@/modules/user-roles/user-roles.module';
import { UserModerationHistoryModule } from '@/modules/user-moderation-history/user-moderation-history.module';
import { MessagesModule } from '@/modules/messages/messages.module';
import { PermissionsModule } from '@/modules/permissions/permissions.module';
import { ResourcesModule } from '@/modules/resources/resources.module';
import { ScopesModule } from '@/modules/scopes/scopes.module';
import { CategoryScopesModule } from '@/modules/category-scopes/category-scopes.module';
import { PoliciesModule } from '@/modules/policies/policies.module';
import { ExamTypesModule } from '@/modules/exam-types/exam-types.module';
import { ExamAttemptsModule } from '@/modules/exam-attempts/exam-attempts.module';
import { ExamAttemptStatusesModule } from '@/modules/exam-attempt-statuses/exam-attempt-statuses.module';
import { StatusesModule } from '@/modules/statuses/statuses.module';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { CountriesModule } from '@/modules/countries/countries.module';
import { LocalitiesModule } from '@/modules/localities/localities.module';
import { RegionsModule } from '@/modules/regions/regions.module';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { GroupsModule } from '@/modules/groups/groups.module';
import { ExamAttemptQuestionsModule } from '@/modules/exam-attempt-questions/exam-attempt-questions.module';
import { UserGroupsModule } from '@/modules/user-groups/user-groups.module';
import { GroupConfigurationsModule } from '@/modules/group-configurations/group-configurations.module';
import { DocumentFoldersModule } from '@/modules/document-folders/document-folders.module';
import { PdfDocumentsModule } from '@/modules/pdf-documents/pdf-documents.module';
import { DocumentVersionsModule } from '@/modules/document-versions/document-versions.module';
import { SearchModule } from '@/modules/search/search.module';


export const loadModules = () => [
  GroupConfigurationsModule,
  UserGroupsModule,
  ExamAttemptQuestionsModule,
  GroupsModule,
  FastifyMulterModule,
  CountriesModule,
  RegionsModule,
  LocalitiesModule,
  JobsModule,
  StatusesModule,
  CacheConfigModule,
  AppConfigModule,
  LoggerModule,
  IdempotencyKeysModule,
  RedisModule,
  UsersModule,
  UserConfigurationsModule,
  DatabaseConfigModule,
  HistoryModule,
  ActionsModule,
  AsyncStorageModule,
  AuthModule,
  PlatformsModule,
  PlatformConfigurationsModule,
  HistoryModule,
  ClientsModule,
  ServicesModule,
  AppUsersModule,
  SubscriptionsModule,
  HealthModule,
  InformationModule,
  InformationContentModule,
  EntitiesModule,
  EmailsModule,
  AppUsersModule,
  AppSeedModule,
  ExamsModule,
  ExamConfigurationsModule,
  ExamRulesModule,
  QuestionsModule,
  AnswerOptionsModule,
  CategoriesModule,
  TagsModule,
  ActionSpecificationsModule,
  OrganizationsModule,
  OrganizationMembersModule,
  ContactPointsModule,
  PostalAddressesModule,
  QuestionConfigurationsModule,
  MigrationModule,
  OrganizationMembersModule,
  ContactPointsModule,
  PostalAddressesModule,
  JsonFetcherModule,
  ModerationStatusModule,
  UserRolesModule,
  UserModerationHistoryModule,
  MessagesModule,
  ResourcesModule,
  PermissionsModule,
  ScopesModule,
  PoliciesModule,
  CategoryScopesModule,
  ExamTypesModule,
  ExamAttemptsModule,
  ExamAttemptStatusesModule,
  DocumentFoldersModule,
  PdfDocumentsModule,
  DocumentVersionsModule,
  SearchModule


];
