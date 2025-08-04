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

export const loadModules = () => [
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
  AppUsersModule
];
