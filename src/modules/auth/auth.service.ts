import {
  HttpStatus,
  Injectable,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestClientTokenDto } from './dto/request-client-token.dto';
import { ConfigService } from '@nestjs/config';
import { manageKeyCloakErrors } from '@/shared/responses/error/manage-keycloak-errors';
import {
  BadRequestCustomResponse,
  ConflictCustomResponse,
  UnauthorizedCustomResponse,
} from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { VerifySessionDto } from './dto/verify-session.dto';
import { decryptSecretKey } from '@/shared/utils/crypto.utils';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { RedisService } from '@/shared/services/redis/redis.service';
import { HttpRequestService } from '@/shared/http-request/http-request.service';
import { LoginDto } from './dto/login.dto';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UpdateForgottenPassword } from './dto/update-forgotten.password.dto';
import {
  checkCapabilities,
  getLastArrayItem,
  isUserAdmin,
  isValidDNI,
  nextDay,
  normalizeUsername,
  transformToLanguageMapType,
} from '@/shared/utils/utils';
import { SecurityCodesService } from '../security-codes/security-codes.service';
import { UsersService } from '../users/users.service';
import {
  SecurityCodeTypes,
  SecurityCodeStatus,
  SecurityCodeEmailsSent,
} from '@/shared/enums/securityCode.enum';
import { AppUsersService } from '../app-users/app-users.service';
import { RegisterAppUserDto } from '../app-users/dto/register-app-user.dto';
import { RedisKeys } from '@/shared/enums/redis-keys.enum';
import { GrantTypesEnum } from '@/shared/enums/grant-types.enum';
import { ServicesService } from '../services/services.service';
import { PlatformsService } from '../platforms/platforms.service';
import { PlatformTechnologies } from '@/shared/enums/platform-technologies.enum';
import { compileVariablesFromString } from '@/shared/utils/handlebars.utils';
import { JsonFetcherService } from '@/shared/services/json-fetcher/json-fetcher.service';
import { HeaderKeysEnum, HeaderValuesEnum } from '@/shared/enums/headers.enum';
import { ModerationStatusService } from '../moderation-status/moderation-status.service';
import { ModerationStatusAliasEnum } from '@/shared/enums/moderation-status.enum';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import { Client } from '../clients/schemas/client.schema';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { LegalDocumentationEnum } from '@/shared/enums/legal-documentation.enum';
import { ModerateUserRegistrationDto } from './dto/moderate-user-registration.dto';
import { MessagesService } from '../messages/messages.service';
import { UserCredentialTypesEnum } from '@/shared/enums/user-credential-types.enum';
import { CreateResourceToIDMServiceDto } from './dto/create-resource-to-idm-service.dto';
import {
  CreatePermissionResponse,
  CreatePolicyResponse,
  CreateResourceResponse,
  RoleResponse,
  UserTokenResponse,
} from '@/shared/interfaces/keycloak-responses.interface';
import { CreatePolicyToIDMServiceDto } from './dto/create-policy-to-idm-service.dto';
import { CreatePermissionToIDMServiceDto } from './dto/create-permission-to-idm-service.dto';
import { CreateClientRoleDto } from './dto/create-client-role.dto';
import { UserRolesService } from '../user-roles/user-roles.service';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { HttpRequestParams } from '@/shared/http-request/interfaces/http-request-params.interface';
import { HistoryService } from '../history/history.service';
import { RequiredUserActionsEnum } from '@/shared/enums/required-user-actions.enum';
import { UpdateIDMUserDto } from './dto/update-idm-user.dto';
import { User } from '../users/schemas/user.schema';
import { decodeToken } from '@/shared/utils/token.utils';
import { UserModerationHistory } from '../user-moderation-history/schemas/user-moderation-history.schema';
import { GroupsService } from '../groups/groups.service';
import { UpdateAppUserDto } from '../app-users/dto/update-app-user.dto';
import { UserGroupsService } from '../user-groups/user-groups.service';
import { SecurityCode } from '../security-codes/schemas/security-code.schema';

@Injectable()
export class AuthService {
  private request = this.httpService.getHttpRequestMethods();
  private readonly authBaseUrl: string;
  private readonly cryptoSecretKey: string;
  private readonly realm: string;
  constructor(
    private readonly httpService: HttpRequestService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly alsService: AsyncStorageService,
    private readonly securityCodesService: SecurityCodesService,
    private readonly usersService: UsersService,
    private readonly appUsersService: AppUsersService,
    private readonly platformsService: PlatformsService,
    private readonly jsonFetcherService: JsonFetcherService,
    private readonly messagesService: MessagesService,
    private readonly userRolesService: UserRolesService,
    private readonly groupsService: GroupsService,
    private readonly historyService: HistoryService,
    private readonly userGroupsService: UserGroupsService,
  ) {
    this.authBaseUrl = this.configService.get<string>('auth.AUTH_BASE_URL');

    this.realm = this.configService.get<string>('auth.REALM');
    this.cryptoSecretKey = this.configService.get<string>(
      'crypto.CRYPTO_SECRET_KEY',
    );
  }

  /**
   * @description This function register a new user. If the user who request the registration is an admin,
   *  the user will be created with moderation status email pending
   * @author Damian
   * @date 13/06/2025
   * @param {RegisterAppUserDto} registerAppUserDto
   * @param {AppUser} [storedAppUser]
   * @param {Client} storedClient
   * @returns {*}
   * @memberof AuthService
   */
  async registerAppUser(params: {
    registerAppUserDto: RegisterAppUserDto;
    storedAppUser?: AppUser;
    storedClient: Client;
    isMigration?: boolean;
  }) {
    try {
      const {
        registerAppUserDto,
        storedAppUser,
        storedClient,
        isMigration = false,
      } = params;
      //check if the user is an admin
      let isAdmin = false;
      if (storedAppUser) {
        checkCapabilities({
          appUser: storedAppUser,
          roles: [RolesEnum.ADMINISTRATOR],
        });
        isAdmin = true;
      }

      const { email, username, legalDocumentation, roles, groups } =
        registerAppUserDto;
      //check if roles exists
      if (roles && roles.length > 0)
        await this.userRolesService.findRoles(roles);

      //check if groups exists
      if (groups && groups.length > 0)
        await this.groupsService.findGroups(groups);
      //fetch the errors from the json file
      const errors = this.jsonFetcherService.fetchErrors([
        HttpStatus.BAD_REQUEST,
        HttpStatus.CONFLICT,
      ]);

      if (
        legalDocumentation &&
        legalDocumentation[LegalDocumentationEnum.DNI]
      ) {
        //check if the DNI is valid
        if (
          !isValidDNI(legalDocumentation[LegalDocumentationEnum.DNI]) &&
          !isMigration
        ) {
          throw new BadRequestCustomResponse(
            errors[400][CustomErrorKeys.INVALID_DNI],
          );
        }
      }

      // //first check if the user already exists
      if (!isMigration) {
        const isUserAlreadyRegistered =
          await this.appUsersService.isUserAlreadyRegistered({
            username,
            email,
            dni: legalDocumentation
              ? legalDocumentation[LegalDocumentationEnum.DNI]
              : null,
          });

        //throw error if the user already exists
        if (isUserAlreadyRegistered) {
          throw new ConflictCustomResponse(
            errors[409][CustomErrorKeys.USER_ALREADY_EXISTS],
          );
        }
      }

      //register the user in keycloak
      const { kcId, newAppUser } = await this.createAppUser({
        ...registerAppUserDto,
        roles: [],
      });

      //if the requester is an admin, add the role to the user of the idm service
      //change moderation status to moderated, and send an email to the user to reset the password
      if (isAdmin) {
        //create the security code to reset the password
        await this.generateResetPasswordToken(newAppUser);

        //add the roles to the user
        if (roles && roles.length > 0) {
          await this.addRolesToUser({
            user: newAppUser.user,
            client: storedClient,
            roles: roles,
          });
        }

        await this.appUsersService.addNewModerationStatus(
          newAppUser._id,
          ModerationStatusAliasEnum.MODERATION_APPROVED,
        );

        await this.appUsersService.addNewModerationStatus(
          newAppUser._id,
          ModerationStatusAliasEnum.MODERATION_EMAIL_RESENT,
        );

        //TODO: send message to the user to reset the password
        // this.messagesService.sendResetPasswordMessage();
      } else {
        //if the requester is not an admin, notify the admin that the user has to be moderated
        //create the moderation status pending

        await this.appUsersService.addNewModerationStatus(
          newAppUser._id,
          ModerationStatusAliasEnum.MODERATION_PENDING,
        );
        //TODO: send message to the admin
        // this.messagesService.sendUserRegistrationMessage();
      }

      return { appUserId: newAppUser._id };
    } catch (error) {
      //TODO: fix historyError
      // await this.historyService.errorHistory({
      //   errorMessage: error.message,
      // });
      console.log(error);
      throw new CustomErrorResponse(error);
    }
  }

  // /**
  //  * @description This function adds roles to a user in the IDM service.
  //  * @author Damian
  //  * @date 12/06/2025
  //  * @private
  //  * @param {AppUser['_id']} appUserId
  //  * @param {string[]} rolesToAdd
  //  * @param {string} kcId
  //  * @memberof AuthService
  //  */
  // private async addRolesToUser(
  //   appUserId: AppUser['_id'],
  //   rolesToAdd: string[],
  //   kcId: string,
  // ) {
  //   const client: Client = this.alsService.get(AlsKeysEnum.CLIENT);
  //   const kcClient = await this.getClientByName(client.clientId);
  //   const roles = await this.getClientRoles(kcClient.id);
  //   //for each role in the request, find the role in the database
  //   const rolesToInsert = roles.filter((role) =>
  //     rolesToAdd.includes(role.name),
  //   );
  //   await Promise.all(
  //     rolesToInsert.map(async (roleToAdd) => {
  //       await this.addRolesIDMUser({
  //         userKeycloakID: kcId,
  //         clientKeycloakID: kcClient.id,
  //         roles: roleToAdd,
  //       });
  //     }),
  //   );
  //   await this.appUsersService.update(appUserId, {
  //     $addToSet: { roles: rolesToAdd },
  //   });
  // }

  /**
   * @description This function creates a new app user and adds a new moderation with status CREATED.
   * @author Damian
   * @date 10/06/2025
   * @private
   * @param {RegisterAppUserDto} registerAppUserDto
   * @returns {*}
   * @memberof AuthService
   */
  private async createAppUser(
    registerAppUserDto: RegisterAppUserDto,
  ): Promise<{ kcId: string; newAppUser: AppUser }> {
    const {
      email,
      roles,
      legalDocumentation,
      name,
      lastName,
      username,
      memberNumber,
      groups,
    } = registerAppUserDto;

    //check if the user already exists in the idm service
    //if it does not exist, create it
    let kcId: string;
    const storedUserInKeyCloak = await this.getUsers(username);
    if (storedUserInKeyCloak) {
      kcId = storedUserInKeyCloak.id;
    } else {
      kcId = await this.registerUserAndReturnsKCID({
        email: registerAppUserDto.email,
        username: registerAppUserDto.username,
      });
    }
    //create the user in the database
    const newAppUser = await this.appUsersService.createAppUser({
      name: name,
      lastName: lastName,
      memberNumber: memberNumber,
      age: registerAppUserDto.age,
      gender: registerAppUserDto.gender,
      legalDocumentation: legalDocumentation,
      address: registerAppUserDto.address,
      job: registerAppUserDto.job,
      contactPoints: registerAppUserDto.contactPoints,
      user: {
        displayName: registerAppUserDto.displayName || username,
        userRegistrationDate: registerAppUserDto.userRegistrationDate,
        username: normalizeUsername(username),
        email: email,
        roles: roles ? roles : [],
        oldId: registerAppUserDto.oldId,
        externalIds: {
          kcID: kcId,
        },
      },
    });

    if (groups && groups.length > 0) {
      await this.userGroupsService.updateUserGroups(newAppUser._id, groups);
    }

    return { kcId, newAppUser };
  }

  /**
   * @description This function returns the user token and the app user id.
   * @author Damian
   * @date 13/06/2025
   * @param {LoginDto} loginDto
   * @param {{
   *       clientId: string;
   *       clientSecret: string;
   *     }} clientParams
   * @returns {*}
   * @memberof AuthService
   */
  async login(
    loginDto: LoginDto,
    clientId: string,
    clientSecret: string,
    client: Client,
  ) {
    //get the user from the credential
    const storedAppUser = await this.appUsersService.findByUserCredentials(
      loginDto.credential,
    );
    //check the lastModeration status, if is not approved, throw an error
    if (!isUserAdmin(storedAppUser)) {
      const lastModeration = getLastArrayItem(
        storedAppUser.moderationStatusHistory,
      );
      if (
        lastModeration.moderationStatus.alias !==
        ModerationStatusAliasEnum.USER_ACTIVATED
      ) {
        throw new UnauthorizedCustomResponse({
          title: 'User is not active',
          key: CustomErrorKeys.USER_IS_NOT_ACTIVE,
          detail: 'User is not active',
        });
      }
    }

    //get the user token
    let userToken = await this.getUserToken({
      loginDto: loginDto,
      clientId: clientId,
      clientSecret: clientSecret,
    });

    //get the uma token
    const umaToken = await this.getUMAToken({
      accessToken: userToken.access_token,
      audience: clientId,
    });

    //update the last login of the user
    await this.appUsersService.updateLastLogin(storedAppUser.user._id);
    await this.clearSessions(
      storedAppUser,
      client,
      decodeToken(umaToken.access_token).sid, //the session id
    );
    //TODO: comprobar array de moderaciones
    if (!this.isUserAlreadyModerated(storedAppUser)) {
      throw new UnauthorizedCustomResponse({
        title: 'User is not active',
        key: CustomErrorKeys.USER_IS_NOT_ACTIVE,
        detail: 'User is not active',
      });
    }
    //return the user token and the app user id
    return {
      ...umaToken,
      appUserId: storedAppUser._id,
      displayName: storedAppUser.user.displayName,
    };
  }

  // /**
  //  * @description This function logs out the user from the idm service.
  //  * @author Damian
  //  * @date 13/06/2025
  //  * @param {string} refreshToken
  //  * @param {string} clientId
  //  * @param {string} clientSecret
  //  * @returns {*}  {Promise<void>}
  //  * @memberof AuthService
  //  */
  // async logout(
  //   refreshToken: string,
  //   clientId: string,
  //   clientSecret: string,
  // ): Promise<void> {
  //   try {
  //     //get the actionEndpoints
  //     const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

  //     //construct the endpoint
  //     const endpoint = await this.platformsService.getCompletedEndpoint({
  //       action: actionEndpoints.logout,
  //       variables: {
  //         realmName: this.realm,
  //       },
  //       client: storedClient,
  //     });

  //     //make the request

  //     await this.request.POST({
  //       endpoint: `${endpoint}`,
  //       headers: {
  //         [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.FORM_URL_ENCODED,
  //       },
  //       data: {
  //         client_id: clientId,
  //         client_secret: clientSecret,
  //         refresh_token: refreshToken,
  //       },
  //     });
  //     return;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  /**
   * @description This function logs out the user and clears the user sessions of the client
   * @author Damian
   * @date 13/06/2025
   * @param {AppUser} appUser
   * @param {Client} client
   * @memberof AuthService
   */
  async clearSessions(appUser: AppUser, client: Client, sessionId?: string) {
    try {
      //get the external id keys from the json file
      const externalIdKeys = this.jsonFetcherService.fetchExternalIdKeys();
      //get the user sessions
      let userSessions = await this.getUserSessions(
        appUser.user.externalIds[externalIdKeys.kcID],
      );

      //filter the user sessions by client
      let filteredSessions = userSessions.filter((session) =>
        session.clients.hasOwnProperty(client.externalIds[externalIdKeys.kcID]),
      );

      //if a sessionId is provided, clear all sessions except the one provided
      if (sessionId) {
        filteredSessions = filteredSessions.filter(
          (session) => session.id !== sessionId,
        );
      }

      //delete the user sessions
      await Promise.all(
        filteredSessions.map((session) => this.deleteSession(session.id)),
      );
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  /**
   * @description This function request a token from a client
   * @author Damian
   * @date 13/06/2025
   * @param {RequestClientTokenDto} requestClientTokenDto
   * @returns {*}
   * @memberof AuthService
   */
  async requestClientToken(requestClientTokenDto: RequestClientTokenDto) {
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      const { clientId, clientSecret } = requestClientTokenDto;
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getToken,
        variables: {
          realmName: this.realm,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.POST({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.FORM_URL_ENCODED,
        },
        data: {
          grant_type: GrantTypesEnum.CLIENT_CREDENTIALS,
          client_id: clientId,
          client_secret: clientSecret,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      manageKeyCloakErrors(error);
    }
  }

  // async registerAppUser(
  //   createAppUserDto: CreateAppUserDto,
  //   clientTokenData: any,
  // ) {
  //   const storedUser = await this.appUsersService.checkIfUserAlreadyExists(
  //     createAppUserDto.user.email,
  //     createAppUserDto.user.username,
  //   );
  //   if (storedUser) {
  //     throw new ConflictCustomResponse({
  //       title: 'User already exists',
  //       key: CustomErrorKeys.USER_ALREADY_EXISTS,
  //       detail: 'User with username or email already exists',
  //     });
  //   }
  //   const storedKeycloakUser = await this.getUserByEmail(
  //     createAppUserDto.user.email,
  //   );
  //   if (storedKeycloakUser) {
  //     throw new ConflictCustomResponse({
  //       title: 'User already exists',
  //       key: CustomErrorKeys.USER_ALREADY_EXISTS,
  //       detail: 'User with username or email already exists',
  //     });
  //   }
  //   const client = await this.getClientByName(clientTokenData.client_id);
  //   const clientRoles = await this.getClientRoles(client.id);
  //   const adminRole = clientRoles.find((role) => role.name === 'admin');
  //   const newKeycloakUserId = await this.registerUserAndReturnsKCID({
  //     password: decryptSecretKey(
  //       createAppUserDto.user.password,
  //       this.cryptoSecretKey,
  //     ),
  //     email: createAppUserDto.user.email,
  //     username: createAppUserDto.user.username,
  //   });
  //   await this.addClientRolesToVisitor({
  //     userKeycloakID: newKeycloakUserId,
  //     clientKeycloakID: client.id,
  //     roles: adminRole, //TODO: el rol llegará por el dto
  //   });

  //   const newAppUser = await this.appUsersService.createAppUser({
  //     ...createAppUserDto,
  //     user: {
  //       ...createAppUserDto.user,
  //       roles: [adminRole.name.toUpperCase()], //TODO: el rol llegará por el dto
  //     },
  //     externalIds: [{ keycloak: newKeycloakUserId }],
  //   });
  //   return { message: 'User created successfully', newAppUser: newAppUser };
  // }

  /**
   * @description This function returns the users from the idm service.
   *  If the userName is provided, it will return the user with the provided username.
   * @author Damian
   * @date 14/06/2025
   * @param {string} [userName]
   * @returns {*}  {Promise<any>}
   * @memberof AuthService
   */
  async getUsers(userName?: string): Promise<any> {
    try {
      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getUsers,
        variables: {
          realmName: this.realm,
        },
        service: idmService,
      });
      const payload: HttpRequestParams = {
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      };
      if (userName) {
        payload.queryParams = {
          username: normalizeUsername(userName),
          exact: true,
        };
      }
      //make the request
      let response = await this.request.GET(payload);
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<any> {
    try {
      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.deleteUser,
        variables: {
          realmName: this.realm,
          userId: userId,
        },
        service: idmService,
      });
      const payload: HttpRequestParams = {
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      };

      //make the request
      let response = await this.request.DELETE(payload);
      return response.data[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkUserPermissions(params: {
    accessToken: string;
    permission: string;
    clientId: string;
  }) {
    try {
      const { accessToken, permission, clientId } = params;

      const umaToken = await this.getUMAToken({
        accessToken: accessToken,
        audience: clientId,
        permission: permission,
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * @description This function verifies if the token session is active via the IDM service.
   * @author Damian
   * @date 13/06/2025
   * @param {VerifySessionDto} verifyTokenDto
   * @returns {*}  {Promise<any>}
   * @memberof AuthService
   */
  async verifyTokenSession(verifyTokenDto: VerifySessionDto): Promise<any> {
    try {
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const ownPlatform = await this.platformsService.getOwnPlatform();
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      var endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.introspectToken,
        variables: {
          realmName: this.realm,
        },
        service: idmService,
      });

      let response = await this.request.POST({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.FORM_URL_ENCODED,
        },
        data: {
          client_id: ownPlatform.clientId,
          client_secret: ownPlatform.clientSecret,
          token: verifyTokenDto.access_token,
        },
      });
      //si está activo, retorna el token descifrado por keycloak, si no, retorna false
      return response.data.active ? response.data : false;
    } catch (error) {
      //TODO: add keycloak validation
      console.log('error verifying client token');
    }
  }

  async registerUserAndReturnsKCID(user: {
    password?: string;
    email: string;
    username: string;
  }) {
    try {
      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );
      const { password, email, username } = user;

      //create the user data payload
      let userData: any = {
        username: normalizeUsername(username),
        email: email.toLowerCase(),
        enabled: true, //TODO: enabled tiene que ser un campo de base de datos o variable de entorno
        emailVerified: false,
        requiredActions: [
          RequiredUserActionsEnum.VERIFY_EMAIL,
          RequiredUserActionsEnum.UPDATE_PASSWORD,
        ],
      };

      //if the password is provided, add it to the user data payload
      if (password) {
        userData.credentials = [
          {
            type: UserCredentialTypesEnum.PASSWORD,
            value: password,
          },
        ];
      }
      //fetch the endpoint actions from the json file
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //create the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.registerUser,
        variables: {
          realmName: this.realm,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.POST({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          Authorization: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        data: userData,
      });
      const kcId = response.headers['location'].split('/').pop();
      return kcId;
    } catch (error) {
      manageKeyCloakErrors(error);
    }
  }

  /**
   * @description This function returns the user token from the idm service.
   * @author Damian
   * @date 13/06/2025
   * @param {{
   *     loginDto: LoginDto;
   *     clientId: string;
   *     clientSecret: string;
   *   }} params
   * @returns {*}
   * @memberof AuthService
   */
  async getUserToken(params: {
    loginDto: LoginDto;
    clientId: string;
    clientSecret: string;
  }): Promise<UserTokenResponse> {
    try {
      const { loginDto, clientId, clientSecret } = params;
      const { credential, password } = loginDto;

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getToken,
        variables: {
          realmName: this.realm,
        },
        service: idmService,
      });

      //make the request
      const { PASSWORD } = GrantTypesEnum;
      const response = await this.request.POST({
        endpoint: `${endpoint}`,
        data: {
          grant_type: PASSWORD,
          client_id: clientId,
          client_secret: clientSecret,
          username: normalizeUsername(credential.toLowerCase()),
          password: password,
        },
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.FORM_URL_ENCODED,
        },
      });

      return response.data as UserTokenResponse;
    } catch (e) {
      console.log(e);
      manageKeyCloakErrors(e);
    }
  }

  /**
   * @description This function returns the uma token from the idm service.
   * @author Damian
   * @date 02/07/2025
   * @param {{
   *     accessToken: string;
   *     audience: string;
   *   }} params
   * @returns {*}  {Promise<any>}
   * @memberof AuthService
   */
  async getUMAToken(params: {
    accessToken: string;
    audience: string; //the client id
    permission?: string;
  }): Promise<any> {
    try {
      const { accessToken, audience, permission } = params;
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getToken, //is the same url as the getToken endpoint
        variables: {
          realmName: this.realm,
        },
        service: idmService,
      });

      //make the request
      const { UMA_TICKET } = GrantTypesEnum;

      const response = await this.request.POST({
        endpoint: `${endpoint}`,
        data: {
          grant_type: UMA_TICKET,
          audience: audience,
          ...(permission && { permission }),
        },
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.FORM_URL_ENCODED,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${accessToken}`,
        },
      });

      return response.data;
    } catch (e) {
      console.log(e);
      manageKeyCloakErrors(e);
    }
  }

  async addRolesIDMUser(params: {
    userKeycloakID: string;
    clientKeycloakID: string;
    roles: any;
  }) {
    const { userKeycloakID, clientKeycloakID, roles } = params;
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.addRolesToUser,
        variables: {
          realmName: this.realm,
          userId: userKeycloakID,
          clientId: clientKeycloakID,
        },
        service: idmService,
      });

      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      //make the request
      let response = await this.request.POST({
        endpoint: `${endpoint}`,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        data: [
          {
            id: roles.id,
            name: roles.name,
          },
        ],
      });

      return response;
    } catch (error: any) {
      console.log(error);
    }
  }

  /**
   * @description This function returns the client roles from the idm service.
   * @author Damian
   * @date 13/06/2025
   * @param {string} clientID
   * @returns {Promise<RoleResponse[]>}
   * @memberof AuthService
   */
  async getClientRoles(
    clientID: string,
    search?: string,
  ): Promise<RoleResponse[]> {
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getClientRoles,
        variables: {
          realmName: this.realm,
          clientId: clientID,
        },
        service: idmService,
      });

      //make the request
      let response: any = await this.request.GET({
        endpoint: `${endpoint}`,
        queryParams: {
          ...(search && { search }),
        },
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      });
      return response.data as RoleResponse[];
    } catch (error: any) {
      console.log(error);
    }
  }

  /**
   * @description This function creates a client role in the idm service.
   * @author Damian
   * @date 13/06/2025
   * @param {CreateClientRoleDto} createClientRoleDto
   * @returns {*}  {Promise<void>}
   * @memberof AuthService
   */
  async createClientRole(
    createClientRoleDto: CreateClientRoleDto,
  ): Promise<void> {
    try {
      const { clientId, name, description, composite, clientRole } =
        createClientRoleDto;
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.createClientRole,
        variables: {
          realmName: this.realm,
          clientId: clientId,
        },
        service: idmService,
      });

      //make the request
      await this.request.POST({
        endpoint: `${endpoint}`,
        data: {
          name: name,
          description: description,
          composite: composite,
          clientRole: clientRole,
        },
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      });
      return;
    } catch (error: any) {
      console.log(error);
    }
  }

  async getClients() {
    try {
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      let response: any = await this.request.GET({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/clients`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(error);
    }
  }

  async getClientByName(id: string) {
    try {
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      let response: any = await this.request.GET({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/clients?clientId=${id}`,
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.FORM_URL_ENCODED,
          Authorization: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      });
      return response.data[0];
    } catch (error: any) {
      throw error;
    }
  }

  async refreshToken(params: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<any> {
    try {
      const { refreshToken, clientId, clientSecret } = params;
      let response: any;
      try {
        response = await this.request.POST({
          triggerError: false,
          endpoint: `${this.authBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
          },
          data: {
            grant_type: 'refresh_token',
            client_id: decryptSecretKey(clientId, this.cryptoSecretKey),
            client_secret: decryptSecretKey(clientSecret, this.cryptoSecretKey),
            refresh_token: refreshToken,
          },
        });
      } catch (e) {
        console.log(e);
        throw new UnauthorizedCustomResponse({
          title: 'Refresh token is invalid',
          key: CustomErrorKeys.REFRESH_TOKEN_NOT_VALID,
          detail: 'Refresh token is invalid',
        });
      }

      const decryptedUserToken = decodeToken(
        response.data.access_token as string,
      );
      //get the user from the credential
      const storedAppUser = await this.appUsersService.findByUserCredentials(
        decryptedUserToken.preferred_username,
      );
      return {
        ...response.data,
        appUserId: storedAppUser._id,
        displayName: storedAppUser.user.displayName,
      };
    } catch (error) {
      if (error.data) {
        //TODO: usar manageKeycloakErrors
        if (error.response.data.error_description === 'Token is not active') {
          throw new UnauthorizedCustomResponse({
            title: error.response.data.error_description,
            detail: error.response.data.error_description,
            key: CustomErrorKeys.REFRESH_TOKEN_NOT_VALID,
          });
        } else {
          throw new UnauthorizedCustomResponse({
            title: error.response.data.error_description,
            detail: error.response.data.error_description,
            key: CustomErrorKeys.INVALID_REFRESH_TOKEN,
          });
        }
      }
      throw error;
    }
  }

  async createResetPasswordSecurityCodeAndSendEmail(
    userCredentialsDto: ForgotPasswordDto,
    requestedByAdmin: boolean = false,
  ) {
    try {
      const credential = userCredentialsDto.userCredential.toLowerCase();

      //find the user by username or email
      const storedUser = await this.usersService.findOne({
        filterOptions: {
          $or: [{ username: credential }, { email: credential }],
        },
        populateOptions: ['configuration'],
      });

      //check if another security code valid already exists
      let securityCode: SecurityCode;
      //if the request is not send by admin, check if there is a valid security code
      if (!requestedByAdmin) {
        securityCode = await this.securityCodesService.findValidSecurityCode(
          storedUser._id,
          SecurityCodeTypes.RESET_PASSWORD,
        );
      }

      //if no security code valid exists, create a new one
      if (!securityCode) {
        securityCode = await this.securityCodesService.create({
          user: storedUser._id,
          status: SecurityCodeStatus.VALID,
          type: SecurityCodeTypes.RESET_PASSWORD,
          expireDate: nextDay(), //TODO: se recogera la fecha de expiración por la configuración del cliente
        });
      }

      //check the number of emails sent
      this.securityCodesService.checkNumberOfEmailsSent(securityCode.emailSent);

      //update the security code email sent
      await this.securityCodesService.update(securityCode._id, {
        emailSent: securityCode.emailSent + 1,
      });
      //TODO: Add History
      return { securityCode: securityCode, storedUser: storedUser };
    } catch (error) {
      console.log(error);
      //TODO: Add History
      throw new CustomErrorResponse(error);
    }
  }

  async updateForgottenPassword(
    updateForgottenPasswordDto: UpdateForgottenPassword,
  ) {
    try {
      const { securityCodeId, newPassword } = updateForgottenPasswordDto;
      //find the security code
      const securityCode =
        await this.securityCodesService.checkSecurityCode(securityCodeId);

      //find the app user
      const storedAppUser = await this.appUsersService.findOne({
        filterOptions: {
          user: securityCode.user._id,
        },
        populateOptions: [
          {
            path: 'user',
            populate: ['roles', { path: 'configuration', select: ['_id'] }],
          },
          {
            path: 'moderationStatusHistory',
            populate: ['moderationStatus'],
          },
        ],
      });

      const keycloakUser = await this.getUsers(storedAppUser.user.username);
      //update the user password
      await this.updateUserPassword(
        keycloakUser.id,
        decryptSecretKey(newPassword, this.cryptoSecretKey),
      );

      //verify the email
      await this.updateIdmUser(keycloakUser.id, {
        emailVerified: true,
        requiredActions: [],
      });

      //Ahora se expira el securityCode, para que no se pueda volver a usar
      await this.securityCodesService.update(securityCode.id, {
        emailSent: securityCode.emailSent + 1,
        status: SecurityCodeStatus.EXPIRED,
      });
      const isUserAdministrator = storedAppUser.user.roles.some(
        (role) => role.alias === RolesEnum.ADMINISTRATOR,
      );
      // if (isUserAdministrator) {
      //   return securityCode;
      // }

      //check if the user is moderated. If so, update the moderation status
      const lastModerationStatus = getLastArrayItem(
        storedAppUser.moderationStatusHistory,
      ).moderationStatus.alias;

      if (
        lastModerationStatus ===
        ModerationStatusAliasEnum.MODERATION_EMAIL_RESENT
      ) {
        //update the moderation status and set the user as active
        await this.usersService.updateUser({
          _id: storedAppUser.user._id,
          configuration: {
            _id: storedAppUser.user.configuration._id,
            isActive: true,
          },
        });
        await this.appUsersService.addNewModerationStatus(
          storedAppUser._id,
          ModerationStatusAliasEnum.USER_ACTIVATED,
        );
      }

      return securityCode;
    } catch (error) {
      console.log(error);

      throw new CustomErrorResponse(error);
    }
  }

  async updateIdmUser(userId: string, updateIDMUserDto: UpdateIDMUserDto) {
    try {
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );
      //creates a custom config object for axios, to implement x-www-form-urlencoded
      const response = await this.request.PUT({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/users/${userId}`,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        data: updateIDMUserDto,
      });
      return response;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  //TODO: no usar varaibles a pelo
  /**
   * @description This function updates the password of a user.
   * @author Damian
   * @date 16/06/2025
   * @param {string} userId
   * @param {string} password
   * @returns {*}  {Promise<any>}
   * @memberof AuthService
   */
  async updateUserPassword(userId: string, password: string): Promise<any> {
    try {
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      //TODO: no se actualiza el password cuando el usaurio ya existe en base de datos
      //creates a custom config object for axios, to implement x-www-form-urlencoded
      const response = await this.request.PUT({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/users/${userId}/reset-password`,
        data: {
          type: 'password',
          value: password,
          temporary: false,
        },
        headers: {
          Authorization: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
          'Content-type': 'application/json',
        },
      });
      return response;
    } catch (error: any) {
      throw new UnauthorizedException(
        error.message,
        CustomErrorKeys.INVALID_CREDENTIALS,
      );
    }
  }
  /**
   * @description This function moderates the user registration.
   * @author Damian
   * @date 13/06/2025
   * @param {ModerateUserRegistrationDto} moderateUserRegistrationDto
   * @param {Client} client
   * @returns {*}
   * @memberof AuthService
   */
  async moderateUserRegistration(
    moderateUserRegistrationDto: ModerateUserRegistrationDto,
    client: Client,
  ) {
    try {
      const { appUserId, status, observation, roles, groups } =
        moderateUserRegistrationDto;

      //check if roles exists
      if (roles && roles.length > 0)
        await this.userRolesService.findRoles(roles);

      //check fi the user exists
      const storedAppUser = await this.appUsersService.findOne({
        filterOptions: { _id: appUserId },
        populateOptions: [{ path: 'user', populate: ['configuration'] }],
      });

      //create a moderation status history and add it to the app user

      await this.appUsersService.addNewModerationStatus(
        appUserId,
        status,
        observation,
      );
      //if the status was accepted, generate a new reset password token and send an email to the user
      if (status === ModerationStatusAliasEnum.MODERATION_APPROVED) {
        //create the security code
        // const securityCode =
        //   await this.generateResetPasswordToken(storedAppUser);
        //add the roles to the user
        if (roles && roles.length > 0) {
          await this.addRolesToUser({
            user: storedAppUser.user,
            client: client,
            roles: roles,
          });
        }

        //if groups is provided, update the user groups
        if (groups && groups.length > 0) {
          await this.userGroupsService.updateUserGroups(
            storedAppUser._id,
            groups,
          );
        }

        //update the moderation status to verify email pending
        await this.appUsersService.addNewModerationStatus(
          storedAppUser._id,
          ModerationStatusAliasEnum.MODERATION_EMAIL_RESENT,
        );
      } else if (
        status === ModerationStatusAliasEnum.MODERATION_REJECTED ||
        status === ModerationStatusAliasEnum.USER_DEACTIVATED
      ) {
        //if the status was rejected, send an email to the user and deactivate the user
        await this.usersService.updateUser({
          _id: storedAppUser.user._id,
          configuration: {
            _id: storedAppUser.user.configuration._id,
            isActive: false,
          },
        });

        //if the status was updated, update the user groups
      } else if (status === ModerationStatusAliasEnum.USER_ACTIVATED) {
        //if the status was rejected, send an email to the user and deactivate the user
        await this.usersService.updateUser({
          _id: storedAppUser.user._id,
          configuration: {
            _id: storedAppUser.user.configuration._id,
            isActive: true,
          },
        });

        //if the status was updated, update the user groups
      }
      return this.appUsersService.findOne({
        filterOptions: {
          _id: storedAppUser._id,
        },
        populateOptions: [
          { path: 'moderationStatusHistory', populate: 'moderationStatus' },
          {
            path: 'user',
            populate: ['roles'],
          },
        ],
      });
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  /**
   * @description This function creates a new resource in the IDM service.
   * @author Damian
   * @date 12/06/2025
   * @param {CreateResourceToIDMServiceDto} createResourceDto
   * @returns {*}  {Promise<CreateResourceResponse>}
   * @memberof AuthService
   */
  async createResource(
    createResourceDto: CreateResourceToIDMServiceDto,
  ): Promise<CreateResourceResponse> {
    try {
      const { clientId, name, scopes, displayName, uris, ownerManagedAccess } =
        createResourceDto;
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.createResource,
        variables: {
          realmName: this.realm,
          clientId: clientId,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.POST({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        data: {
          name: name,
          displayName: displayName,
          uris: uris,
          scopes: scopes,
          ownerManagedAccess: ownerManagedAccess,
        },
      });
      return response.data as CreateResourceResponse;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  /**
   * @description This function gets the resources from the idm service.
   * @author Damian
   * @date 13/06/2025
   * @param {string} clientId
   * @param {string} [name]
   * @returns {*}  {Promise<CreateResourceResponse[]>}
   * @memberof AuthService
   */
  async getResources(
    clientId: string,
    name?: string,
  ): Promise<CreateResourceResponse[]> {
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.createResource,
        variables: {
          realmName: this.realm,
          clientId: clientId,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.GET({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        queryParams: {
          ...(name && { name }), // Solo se agrega si name no es undefined
        },
      });
      return response.data as CreateResourceResponse[];
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  async getScopes(clientId: string, name?: string): Promise<any[]> {
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getScopes,
        variables: {
          realmName: this.realm,
          clientId: clientId,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.GET({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        queryParams: {
          ...(name && { name }), // Solo se agrega si name no es undefined
        },
      });
      return response.data as any[];
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  /**
   * @description This function returns the policies from the idm service.
   * @author Damian
   * @date 16/06/2025
   * @param {string} clientID
   * @param {string} [name]
   * @returns {*}
   * @memberof AuthService
   */
  async getClientPermissions(clientID: string, name?: string) {
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getClientPermissions,
        variables: {
          realmName: this.realm,
          clientId: clientID,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.GET({
        endpoint: `${endpoint}`,
        queryParams: {
          ...(name && { name }), // Solo se agrega si name no es undefined
        },
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      });
      return response.data as CreatePermissionResponse[];
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @description This function returns the user sessions of the client
   * @author Damian
   * @date 13/06/2025
   * @param {string} clientId
   * @param {string} [userId]
   * @returns {*}  {Promise<any>}
   * @memberof AuthService
   */
  async getUserSessions(userId: string): Promise<any> {
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getClientSessions,
        variables: {
          realmName: this.realm,
          userId: userId,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.GET({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  /**
   * @description This function deletes a user session
   * @author Damian
   * @date 13/06/2025
   * @param {string} sessionId
   * @returns {*}  Promise<void>
   * @memberof AuthService
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.deleteSession,
        variables: {
          realmName: this.realm,
          sessionId: sessionId,
        },
        service: idmService,
      });

      //make the request
      await this.request.DELETE({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      });
      return;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  /**
   * @description This function creates a policy in the IDM service.
   * @author Damian
   * @date 13/06/2025
   * @param {CreatePolicyToIDMServiceDto} createPolicyDto
   * @returns {*}  {Promise<CreatePolicyResponse>}
   * @memberof AuthService
   */
  async createPolicy(
    createPolicyDto: CreatePolicyToIDMServiceDto,
  ): Promise<CreatePolicyResponse> {
    try {
      const {
        clientId,
        name,
        decisionStrategy,
        description,
        logic,
        roles,
        type,
      } = createPolicyDto;
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.createPolicy,
        variables: {
          realmName: this.realm,
          clientId: clientId,
        },
        service: idmService,
      });

      //make the request

      let response = await this.request.POST({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        data: {
          name: name,
          description: description,
          type: type,
          roles: roles,
          logic: logic,
          decisionStrategy: decisionStrategy,
        },
      });
      return response.data as CreatePolicyResponse;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  async createScope(createScopeDto: any): Promise<any> {
    try {
      const { clientId, name, displayName, iconUri } = createScopeDto;
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.createScope,
        variables: {
          realmName: this.realm,
          clientId: clientId,
        },
        service: idmService,
      });

      //make the request

      let response = await this.request.POST({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        data: {
          name: name,
          displayName: displayName,
          iconUri: iconUri,
        },
      });
      return response.data as any;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  /**
   * @description This function creates a permission in the IDM service.
   * @author Damian
   * @date 13/06/2025
   * @param {CreatePermissionToIDMServiceDto} createPermissionDto
   * @returns {*}  {Promise<CreatePermissionResponse>}
   * @memberof AuthService
   */
  async createPermission(
    createPermissionDto: CreatePermissionToIDMServiceDto,
  ): Promise<CreatePermissionResponse> {
    try {
      const {
        clientId,
        name,
        decisionStrategy,
        description,
        logic,
        policies,
        // scopes,
        resources,
        type,
      } = createPermissionDto;
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.createPermission,
        variables: {
          realmName: this.realm,
          clientId: clientId,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.POST({
        endpoint: endpoint,
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        data: {
          name: name,
          description: description,
          type: type,
          resources: resources,
          // scopes: scopes,
          policies: policies,
          logic: logic,
          decisionStrategy: decisionStrategy,
        },
      });
      return response.data as CreatePermissionResponse;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  /**
   * @description This function returns the policies from the idm service.
   * @author Damian
   * @date 16/06/2025
   * @param {string} clientID
   * @param {string} [name]
   * @returns {*}
   * @memberof AuthService
   */
  async getClientPolicy(clientID: string, name?: string) {
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.getClientPolicy,
        variables: {
          realmName: this.realm,
          clientId: clientID,
        },
        service: idmService,
      });

      //make the request
      let response = await this.request.GET({
        endpoint: `${endpoint}`,
        queryParams: {
          ...(name && { name }), // Solo se agrega si name no es undefined
        },
        headers: {
          [HeaderKeysEnum.CONTENT_TYPE]: HeaderValuesEnum.APPLICATION_JSON,
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
      });
      return response.data as CreatePolicyResponse[];
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  async addRolesToUser(params: {
    user: User;
    client: Client;
    roles: string[];
  }) {
    try {
      //for each role, find it on the idm service and add it to the idm user
      //then add the roles to the user in the database
      const { user, client, roles } = params;
      //find the stored roles from database
      const storedRoles = await this.userRolesService.findRoles(roles);
      //find the client roles from the idm service
      const idmClientRoles = await this.getClientRoles(client.externalIds.kcID);
      //find the roles to add
      const rolesToAdd = idmClientRoles.filter((idmRole) =>
        storedRoles.find((role) => role.alias === idmRole.name),
      );
      //add the roles to the user
      await Promise.all(
        rolesToAdd.map(async (roleToAdd) => {
          await this.addRolesIDMUser({
            userKeycloakID: user.externalIds.kcID,
            clientKeycloakID: client.externalIds.kcID,
            roles: roleToAdd,
          });
        }),
      );
      await this.usersService.addRolesToUser(user._id, roles);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateUserRoles(params: {
    user: User;
    client: Client;
    roles: string[]; // estos son los alias (o nombres amigables) desde el front
  }) {
    try {
      const { user, client, roles: desiredRoleIds } = params;

      // 1. Obtener roles actuales del usuario desde base de datos
      const currentUserRoles = await this.usersService.getUserRoles(user._id); // devuelve roles con alias

      // 2. Obtener todos los roles posibles desde base de datos (los que el frontend envía)
      const desiredRoles =
        await this.userRolesService.findRoles(desiredRoleIds);

      // 3. Obtener todos los roles posibles del cliente desde Keycloak
      const idmClientRoles = await this.getClientRoles(client.externalIds.kcID); // { id, name }

      // 4. Mapear alias deseados a roles IDM
      const desiredIdmRoles = idmClientRoles.filter((idmRole) =>
        desiredRoles.find((dbRole) => dbRole.alias === idmRole.name),
      );

      // 5. Mapear alias actuales del usuario a roles IDM
      const currentIdmRoles = idmClientRoles.filter((idmRole) =>
        currentUserRoles.find((dbRole) => dbRole.alias === idmRole.name),
      );
      // 6. Determinar qué roles hay que añadir
      const rolesToAdd = desiredIdmRoles.filter(
        (role) => !currentIdmRoles.some((r) => r.id === role.id),
      );

      // 7. Determinar qué roles hay que eliminar
      const rolesToRemove = currentIdmRoles.filter(
        (role) => !desiredIdmRoles.some((r) => r.id === role.id),
      );

      // 8. Añadir nuevos roles en Keycloak
      if (rolesToAdd.length > 0) {
        await Promise.all(
          rolesToAdd.map(async (roleToAdd) => {
            await this.addRolesIDMUser({
              userKeycloakID: user.externalIds.kcID,
              clientKeycloakID: client.externalIds.kcID,
              roles: roleToAdd,
            });
          }),
        );
      }

      // 9. Eliminar roles antiguos en Keycloak
      if (rolesToRemove.length > 0) {
        await this.removeRolesIDMUser({
          userKeycloakID: user.externalIds.kcID,
          clientKeycloakID: client.externalIds.kcID,
          roles: rolesToRemove,
        });
      }

      // 10. Actualizar en base de datos solo los nuevos roles deseados
      await this.usersService.updateUserRoles(user._id, desiredRoleIds);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async removeRolesIDMUser(params: {
    userKeycloakID: string;
    clientKeycloakID: string;
    roles: { id: string; name: string }[];
  }) {
    const { userKeycloakID, clientKeycloakID, roles } = params;
    try {
      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      const idmService =
        await this.platformsService.getClientOrServiceFromByTechnology({
          technology: PlatformTechnologies.IDENTITY_MANAGER,
          isService: true,
        });
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.removeRolesFromUser,
        variables: {
          realmName: this.realm,
          userId: userKeycloakID,
          clientId: clientKeycloakID,
        },
        service: idmService,
      });

      //get the admin token from redis
      const adminToken: any = await this.redisService.get(
        RedisKeys.OWN_PLATFORM_TOKEN,
      );

      //make the request
      let response = await this.request.DELETE({
        endpoint: `${endpoint}`,
        headers: {
          [HeaderKeysEnum.AUTHORIZATION]: `${HeaderValuesEnum.BEARER} ${adminToken.access_token}`,
        },
        data: roles,
      });

      return response;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @description This function generates a reset password token for the provided user.
   * @author Damian
   * @date 13/06/2025
   * @private
   * @param {AppUser} storedAppUser
   * @memberof AuthService
   */
  private async generateResetPasswordToken(storedAppUser: AppUser) {
    return await this.securityCodesService.create({
      user: storedAppUser.user._id,
      status: SecurityCodeStatus.VALID,
      type: SecurityCodeTypes.RESET_PASSWORD,
      emailSent: SecurityCodeEmailsSent.FIRST_EMAIL_SENT, // first email to be sent
      expireDate: nextDay(),
    });
  }

  /**
   * @description This function checks if the user is already moderated.
   * @author Damian
   * @date 20/06/2025
   * @private
   * @param {AppUser} storedAppUser
   * @returns {*}  {boolean}
   * @memberof AuthService
   */
  private async isUserAlreadyModerated(storedAppUser: AppUser) {
    const roles = storedAppUser.user.roles;
    const isAdmin = roles.some(
      (role) => role.alias === RolesEnum.ADMINISTRATOR,
    );
    if (isAdmin) {
      return true;
    }
    //get the last moderation
    const lastModerationStatus = getLastArrayItem<UserModerationHistory>(
      storedAppUser.moderationStatusHistory,
    );
    if (!lastModerationStatus) return false;
    const lastModerationStatusAlias = lastModerationStatus.moderationStatus
      .alias as ModerationStatusAliasEnum;

    const { USER_ACTIVATED } = ModerationStatusAliasEnum;

    //array of allowed moderation statuses
    const allowedModerationStatuses = [USER_ACTIVATED];
    if (allowedModerationStatuses.includes(lastModerationStatusAlias))
      return true;

    return false;
  }

  async updateAppUser(
    updateAppUserDto: UpdateAppUserDto,
    client: Client,
    requesterUser: AppUser,
  ) {
    try {
      //first, check if the requester user is an admin
      //if is admin, the requester user can update the roles and the groups of the user
      //else, the requester user can only update the other attributes of the user
      const isAdmin = requesterUser.user.roles.some(
        (role) => role.alias === RolesEnum.ADMINISTRATOR,
      );
      //find the app user to update
      const storedAppUserToUpdate = await this.appUsersService.findOne({
        filterOptions: {
          _id: updateAppUserDto._id,
        },
        populateOptions: [
          {
            path: 'user',
            populate: ['roles'],
          },
        ],
      });
      //if is admin
      if (isAdmin) {
        //if the request has roles, check if exists and update it
        if (updateAppUserDto.roles) {
          //check if the roles exists
          await this.userRolesService.findRoles(updateAppUserDto.roles);
          //update the roles of the user
          await this.updateUserRoles({
            user: storedAppUserToUpdate.user,
            client: client,
            roles: updateAppUserDto.roles,
          });
        }
        //check if the groups exists
        if (updateAppUserDto.groups) {
          await this.userGroupsService.updateUserGroups(
            updateAppUserDto._id,
            updateAppUserDto.groups,
          );
        }
      }

      //then, update the other attributes of the user
      await this.appUsersService.updateAppUser(updateAppUserDto);
      return { message: 'User updated successfully' };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
