import { Injectable } from '@nestjs/common';
import usersMigrationJson from '@/shared/database/data/migration-json/exported_users_2.json';
import appUsersMockDev from '@/shared/database/data/seed-mocks/development-seed/app-users.mock.json';
import clientMockDev from '@/shared/database/data/seed-mocks/development-seed/client.mock.json';
import { AppUsersService } from '@/modules/app-users/app-users.service';
import { AuthService } from '@/modules/auth/auth.service';
import { RegisterAppUserDto } from '@/modules/app-users/dto/register-app-user.dto';
import { UserRolesService } from '@/modules/user-roles/user-roles.service';
import { ClientsService } from '@/modules/clients/clients.service';
import { RedisKeys } from '@/shared/enums/redis-keys.enum';
import {
  convertToUTC,
  isNumeric,
  normalizeUsername,
  secondsToMinutes,
  sliceFrom,
  toE164,
  transformToLanguageMapType,
} from '@/shared/utils/utils';
import { PlatformsService } from '@/modules/platforms/platforms.service';
import { RedisService } from '@/shared/services/redis/redis.service';
import { UsersService } from '@/modules/users/users.service';
import { CountriesService } from '@/modules/countries/countries.service';
import { LocalitiesService } from '@/modules/localities/localities.service';
import { RegionsService } from '@/modules/regions/regions.service';
import { PlatformTechnologies } from '@/shared/enums/platform-technologies.enum';
import { RolesSeedService } from '../seed/roles-seed.service';
import { UserRole } from '@/modules/user-roles/schemas/user-role.schemas';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { ContactPointsEnum } from '@/shared/enums/contact-points.enum';
import { OldUser } from '@/shared/interfaces/old-database-users.interface';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';

@Injectable()
export class UsersMigrationService {
  private readonly appUserMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? appUsersMockDev
      : appUsersMockDev; //TODO: add seed for production
  private readonly clientMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? clientMockDev
      : clientMockDev; //TODO: add seed for production
  constructor(
    private readonly appUsersService: AppUsersService,
    private readonly authService: AuthService,
    private readonly userRolesService: UserRolesService,
    private readonly clientsService: ClientsService,
    private readonly platformsService: PlatformsService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly localitiesService: LocalitiesService,
  ) {}

  async migrateUsersFromFile() {
    const migrationJson = sliceFrom(usersMigrationJson, 4);
    await this.migrateUsers(migrationJson);
  }

  async migrateUsers(users: OldUser[]) {
    try {
      //omit the first 4 users
      // let migrationJson = sliceFrom(usersMigrationJson, 4);
      //first, get the user admin to call the registerUser from auth service
      const storedAdminAppUser =
        await this.appUsersService.findByUserCredentials(
          this.appUserMock[0].user.email,
        );

      const {
        SOCIO,
        NO_SOCIO,
        EXAMENES,
        EXAMENESV2,
        EXAMENESV3,
        ADMINISTRATOR,
      } = RolesEnum;

      const allowedRoles = [
        SOCIO,
        NO_SOCIO,
        EXAMENES,
        EXAMENESV2,
        EXAMENESV3,
        ADMINISTRATOR,
      ] as string[];

      // Obtener todos los roles permitidos desde BBDD en un solo paso (mejor para performance)
      const storedAllowedRoles = await this.userRolesService.findAll({
        filterOptions: {
          alias: { $in: allowedRoles },
        },
      });

      // Mapeamos por alias para acceso rápido
      const storedRolesByAlias = storedAllowedRoles.reduce(
        (acc, role) => {
          acc[role.alias] = role;
          return acc;
        },
        {} as Record<string, UserRole>,
      );

      //set the platform own token in redis, because it will be needed when calling to the idmService
      await this.setOwnPlatformToken();
      //find the client UOAPP
      const storedClient = await this.clientsService.findOne({
        populateOptions: [
          { path: 'configuration', populate: 'servicesEntrypoints' },
        ],
        filterOptions: {
          alias: this.clientMock.alias,
        },
        triggerError: false,
      });

      // const deletedUsers = migrationJson.map(async (user) => {
      //   try {
      //     const storedUser = await this.usersService.findOne({
      //       filterOptions: {
      //         username: user.user_login,
      //       },
      //       triggerError: false,
      //     });
      //     if (!storedUser) return;
      //     await this.authService.deleteUser(storedUser.externalIds['kcID']);
      //   } catch (error) {
      //     console.error(`Error deleting user ${user.user_email}:`, error);
      //   }
      // });
      // await Promise.all(deletedUsers);

      const migrationPromises = users.map(async (user) => {
        try {
          if (user.account_status === 'rejected') {
            return;
          }

          const storedAppUser = await this.usersService.findOne({
            filterOptions: {
              username: normalizeUsername(user.user_login),
            },
            triggerError: false,
          });
          if (storedAppUser) {
            return;
          }

          // user.roles es array de aliases (strings)
          const userRolesAliases = user.roles || [];

          // Filtrar solo roles permitidos del usuario
          const filteredRoles = userRolesAliases.filter((alias) =>
            allowedRoles.includes(alias),
          );

          // if (filteredRoles.length === 0) {
          //   throw new BadRequestCustomResponse({
          //     title: 'User does not have a valid allowed role',
          //     key: CustomErrorKeys.VALIDATION_ERROR,
          //     detail: `User ${user.user_login} does not have any of the allowed roles`,
          //   });
          // }

          //if the user is not socio, no socio or admin, add one of the roles
          if (
            !filteredRoles.includes(NO_SOCIO) &&
            !filteredRoles.includes(SOCIO) &&
            !filteredRoles.includes(ADMINISTRATOR)
          ) {
            if (user.nsocio !== '' && isNumeric(user.nsocio)) {
              filteredRoles.push(SOCIO);
            } else {
              filteredRoles.push(NO_SOCIO);
            }
          }

          // Obtener los ids de los roles permitidos filtrados
          const userRoleIds = filteredRoles
            .map((alias) => storedRolesByAlias[alias])
            .filter((role) => role != null)
            .map((role) => role._id);

          let storedLocalityId: string = null;
          if (user.city !== '' && user.city !== null) {
            let storedLocality = await this.localitiesService.findOne({
              filterOptions: {
                'value.languageMap.es': user.localidad,
              },
              triggerError: false,
            });

            if (!storedLocality) {
              storedLocality = await this.localitiesService.createLocality({
                value: { es: user.localidad },
              });
            }
            storedLocalityId = storedLocality._id;
          }

          const parsedAttributes: RegisterAppUserDto =
            parseAttributesFromMigration(user, userRoleIds, storedLocalityId);

          await this.authService.registerAppUser({
            registerAppUserDto: parsedAttributes,
            storedAppUser: storedAdminAppUser,
            storedClient: storedClient,
            isMigration: true,
          });
        } catch (error) {
          console.error(`Error migrating user ${user.user_email}:`, error);
          // No relanzamos para evitar romper el Promise.all
        }
      });

      await Promise.all(migrationPromises);

      console.log('Users migration successfully.');
    } catch (error) {
      console.error('Error migrating users:', error);
      throw error;
    }

    function parseAttributesFromMigration(
      user: OldUser,
      userRoleIds: UserRole['_id'][],
      storedLocalityId: string,
    ): RegisterAppUserDto {
      return {
        name: user.first_name,
        lastName: user.last_name,
        username: user.user_login,
        memberNumber: user.nsocio,
        description: user.description,
        email: user.user_email.toLowerCase().trim(),
        roles: userRoleIds,
        ...(user.dni_number && {
          legalDocumentation: {
            DNI: user.dni_number,
          },
        }),
        ...(user.phone_number && {
          contactPoints: [
            {
              type: ContactPointsEnum.PHONE,
              value: toE164(user.phone_number),
            },
          ],
        }),
        ...((storedLocalityId || user.city) && {
          address: {
            ...(storedLocalityId && {
              addressLocality: storedLocalityId,
            }),
            ...(user.city && {
              addressCity: {
                es: user.city,
              },
            }),
          },
        }),
        job: user.empleo,
        displayName: user.display_name,
        oldId: user.user_id,
        userRegistrationDate: convertToUTC(
          new Date(user.user_registered),
          'Europe/Madrid',
        ),
      };
    }
  }

  //function to get the ownPlatformToken
  private async setOwnPlatformToken() {
    console.log('Setting own platform token in redis...');
    const ownPlatform = await this.platformsService.getOwnPlatform();

    const newToken = await this.authService.requestClientToken({
      clientId: ownPlatform.clientId,
      clientSecret: ownPlatform.clientSecret,
    });
    await this.redisService.set({
      key: RedisKeys.OWN_PLATFORM_TOKEN,
      value: newToken,
      minutes: secondsToMinutes(newToken.expires_in),
    });
  }
}
