import { Injectable } from '@nestjs/common';
import resourcesMockDev from '@/shared/database/data/seed-mocks/development-seed/resource.mock.json';
import rolesMockDev from '@/shared/database/data/seed-mocks/development-seed/roles.mock.json';
import scopesMockDev from '@/shared/database/data/seed-mocks/development-seed/scopes.mock.json';
import { ClientsService } from '@/modules/clients/clients.service';
import { compileVariablesFromJSON } from '../../utils/handlebars.utils';
import { AuthService } from '@/modules/auth/auth.service';
import { RedisKeys } from '@/shared/enums/redis-keys.enum';
import { secondsToMinutes } from '@/shared/utils/utils';
import { PlatformsService } from '@/modules/platforms/platforms.service';
import { RedisService } from '@/shared/services/redis/redis.service';
import { JsonFetcherService } from '@/shared/services/json-fetcher/json-fetcher.service';
import { Client } from '@/modules/clients/schemas/client.schema';
import { ServicesService } from '@/modules/services/services.service';
import { PlatformTechnologies } from '@/shared/enums/platform-technologies.enum';
import { Service } from '@/modules/services/schemas/service.schema';
import { UserRolesService } from '@/modules/user-roles/user-roles.service';
import {
  CreateResourceResponse,
  RoleResponse,
} from '@/shared/interfaces/keycloak-responses.interface';
import { LanguageMapType } from '@/shared/types/language-map.type';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';

@Injectable()
export class RolesSeedService {
  private readonly resourcesMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? resourcesMockDev
      : resourcesMockDev; //TODO: add seed for production

  private readonly scopesMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? scopesMockDev
      : scopesMockDev; //TODO: add seed for production

  private readonly rolesMock =
    process.env.NODE_ENV === NodeEnvEnum.DEVELOPMENT
      ? rolesMockDev
      : rolesMockDev;
  constructor(
    private readonly authService: AuthService,
    private readonly platformsService: PlatformsService,
    private readonly redisService: RedisService,
    private readonly clientsService: ClientsService,
    private readonly jsonFetcherService: JsonFetcherService,
    private readonly servicesService: ServicesService,
    private readonly userRolesService: UserRolesService,
  ) {}

  async seedRoles() {
    try {
      const rolesCount = await this.userRolesService.countDocuments();
      if (rolesCount > 0) return;
      const externalIdKeys = this.jsonFetcherService.fetchExternalIdKeys();
      const storedClient = await this.clientsService.findOne({
        filterOptions: { clientId: process.env.FRONTEND_CLIENT_ID },
      });
      const defaultLanguage =
        await this.clientsService.getClientDefaultLanguage(storedClient._id);

      const storedIDMService = await this.servicesService.findOne({
        filterOptions: { technology: PlatformTechnologies.IDENTITY_MANAGER },
      });

      //setting own platform token in redis because it will be needed in the next request
      await this.setOwnPlatformToken();

      //create the resources
      const resources = await this.createResources(
        storedClient,
        externalIdKeys,
      );

      //create the scopes
      await this.createScopes(storedClient, externalIdKeys);
      //create the roles
      await this.createRoles(
        defaultLanguage,
        storedClient,
        storedIDMService,
        externalIdKeys,
        resources,
      );

      console.log('User roles seeded successfully.');
    } catch (error) {
      console.error('Error seeding roles:', error);
      throw error;
    }
  }

  private async createResources(
    storedClient: Client,
    externalIdKeys: { kcID: string },
  ) {
    const resources: CreateResourceResponse[] = [];
    await Promise.all(
      this.resourcesMock.map(async (resource) => {
        let storedResourceInIDMService = await this.authService.getResources(
          storedClient.externalIds[externalIdKeys.kcID],
          resource.name,
        );
        if (storedResourceInIDMService.length > 0) {
          //TODO: crear el resource en base de datos, con la id de la respuesta
        } else {
          // await Promise.all(
          //   resource.scopes.map(async (scope) => {
          //     let storedScopeInIDMService = await this.authService.getScopes(
          //       storedClient.externalIds[externalIdKeys.kcID],
          //       scope.name,
          //     );
          //     if (storedScopeInIDMService.length > 0) {
          //     } else {
          //       await this.authService.createScope({
          //         clientId: storedClient.externalIds[externalIdKeys.kcID],
          //         name: scope,
          //         displayName: scope,
          //         iconUri: '',
          //       });
          //     }
          //   }),
          // );
          storedResourceInIDMService = [
            await this.authService.createResource({
              clientId: storedClient.externalIds[externalIdKeys.kcID],
              name: resource.name,
              scopes: resource.scopes,
              displayName: resource.displayName,
              uris: resource.uris,
              ownerManagedAccess: resource.ownerManagedAccess,
            }),
          ];

          //TODO: crear el resource en base de datos, con la id de la respuesta
        }
        resources.push(storedResourceInIDMService[0]);
      }),
    );
    return resources;
  }

  private async createScopes(
    storedClient: Client,
    externalIdKeys: { kcID: string },
  ) {
    const scopes: any[] = [];
    await Promise.all(
      this.scopesMock.map(async (scope) => {
        let storedScopeInIDMService = await this.authService.getScopes(
          storedClient.externalIds[externalIdKeys.kcID],
          scope,
        );
        if (storedScopeInIDMService.length > 0) {
          //TODO: crear el resource en base de datos, con la id de la respuesta
        } else {
          storedScopeInIDMService = [
            await this.authService.createScope({
              clientId: storedClient.externalIds[externalIdKeys.kcID],
              name: scope,
              displayName: scope,
              iconUri: '',
            }),
          ];

          //TODO: crear el resource en base de datos, con la id de la respuesta
        }
        scopes.push(storedScopeInIDMService[0]);
      }),
    );
    return scopes;
  }

  private async createRoles(
    defaultLanguage: string,
    storedClient: Client,
    storedIDMService: Service,
    externalIdKeys: { kcID: string },
    resources: CreateResourceResponse[],
  ) {
    await Promise.all(
      this.rolesMock.map(async (role) => {
        //get the role from database
        const storedRoleInDatabase = await this.userRolesService.findOne({
          filterOptions: {
            alias: role.alias,
          },
          triggerError: false,
        });
        //if the role already exists, return
        if (storedRoleInDatabase) return; //TODO: descomentar

        //get the role from the idm service
        let storedRoleInIDMService = await this.authService.getClientRoles(
          storedClient.externalIds[externalIdKeys.kcID],
          role.alias,
        );
        if (storedRoleInIDMService.length <= 0) {
          //create the role in the idm service
          await this.authService.createClientRole({
            clientId: storedClient.externalIds[externalIdKeys.kcID],
            name: role.alias,
            description: role.description.languageMap[defaultLanguage],
            composite: role.composite,
            clientRole: role.clientRole,
          });

          //get the new role created
          storedRoleInIDMService = await this.authService.getClientRoles(
            storedClient.externalIds[externalIdKeys.kcID],
            role.alias,
          );

          //create the role in database
        }
        const newRole = await this.createRoleInDatabase(
          role,
          storedIDMService,
          storedRoleInIDMService,
        );
        return;
        if (storedRoleInIDMService.length > 0) {
          //now check if exists a policy with the role associated
          let storedPolicyInIDMService = await this.authService.getClientPolicy(
            storedClient.externalIds[externalIdKeys.kcID],
            role.policy.name,
          );
          if (storedPolicyInIDMService.length <= 0) {
            await this.authService.createPolicy({
              clientId: storedClient.externalIds[externalIdKeys.kcID],
              name: role.policy.name,
              description: role.policy.description,
              type: role.policy.type,
              logic: role.policy.logic,
              decisionStrategy: role.policy.decisionStrategy,
              roles: [
                {
                  id: storedRoleInIDMService[0].id,
                  required: 'true',
                },
              ],
            });

            //find the policy in the idm service again, to get the id
            storedPolicyInIDMService = await this.authService.getClientPolicy(
              storedClient.externalIds[externalIdKeys.kcID],
              role.policy.name,
            );
          }

          let storedPermissionInIDMService =
            await this.authService.getClientPermissions(
              storedClient.externalIds[externalIdKeys.kcID],
              role.permission.name,
            );

          if (storedPermissionInIDMService.length <= 0) {
            //for each resource, check if it exists on the json,
            //if exists, return the id
            const filteredResources = resources.filter((resource) => {
              if (role.permission.resources.includes(resource.name)) {
                return resource;
              }
            });

            await this.authService.createPermission({
              clientId: storedClient.externalIds[externalIdKeys.kcID],
              name: role.permission.name,
              description: role.permission.description,
              type: role.permission.type,
              resources: filteredResources.map((resource) => resource._id),
              // scopes: role.permission.scopes,
              policies: [storedPolicyInIDMService[0].id],
              logic: role.permission.logic,
              decisionStrategy: role.permission.decisionStrategy,
            });
          }

          //TODO: create the policy and the permission in database
        } else {
        }
      }),
    );
  }

  private async createRoleInDatabase(
    role: {
      _id: string;
      name: LanguageMapType;
      description: LanguageMapType;
      alias: string;
      composite: boolean;
      clientRole: boolean;
    },
    storedIDMService: Service,
    storedRoleInIDMService: RoleResponse[],
  ) {
    return await this.userRolesService.createUserRole({
      _id: role._id,
      name: role.name,
      alias: role.alias,
      description: role.description,
      serviceId: storedIDMService._id,
      externalId: storedRoleInIDMService[0].id,
      parents: [],
      permissions: [],
    });
  }

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
