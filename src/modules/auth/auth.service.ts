import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestClientTokenDto } from './dto/request-client-token.dto';
import { ConfigService } from '@nestjs/config';
import { manageKeyCloakErrors } from '@/shared/responses/error/manage-keycloak-errors';
import {
  BadRequestCustomResponse,
  ConflictCustomResponse,
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
import { nextDay } from '@/shared/utils/utils';
import { SecurityCodesService } from '../security-codes/security-codes.service';
import { UsersService } from '../users/users.service';
import {
  SecurityCodeTypes,
  SecurityCodeStatus,
} from '@/shared/enums/securityCode.enum';
import { AppUsersService } from '../app-users/app-users.service';
import { RegisterAppUserDto } from '../app-users/dto/register-app-user.dto';

@Injectable()
export class AuthService {
  private request = this.httpService.getHttpRequestMethods();
  private readonly authBaseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
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
  ) {
    this.authBaseUrl = this.configService.get<string>('auth.AUTH_BASE_URL');
    this.clientId = this.configService.get<string>('auth.CLIENT_ID');
    this.clientSecret = this.configService.get<string>('auth.CLIENT_SECRET');
    this.realm = this.configService.get<string>('auth.REALM');
    this.cryptoSecretKey = this.configService.get<string>(
      'crypto.CRYPTO_SECRET_KEY',
    );
  }
 async registerAppUser(registerAppUserDto: RegisterAppUserDto) {
    try {
      const storedUser = await this.appUsersService.checkIfUserAlreadyExists(
        registerAppUserDto.email,
        registerAppUserDto.username,
      );

      if (storedUser) {
        throw new ConflictCustomResponse({
          title: 'User already exists',
          key: CustomErrorKeys.USER_ALREADY_EXISTS,
          detail: 'User with username or email already exists',
        });
      }
      //TODO: dont use this function, change it
      const storedKeycloakUser = await this.getUserByEmail(
        registerAppUserDto.email
      );
      let kcId: string;
      if (storedKeycloakUser) {
        //If user already exists in Keycloak, use the existing ID
        kcId = storedKeycloakUser.id;
        console.log("user exists in keycloak", kcId); 
        
      } else {
       kcId = await this.registerUserAndReturnsKCID(
        {
          password: decryptSecretKey(registerAppUserDto.password,this.cryptoSecretKey ),
          email: registerAppUserDto.email,
          username: registerAppUserDto.username,
        },
        
      );
      console.log("new user created in keycloak", kcId);
      
    }
     const newAppUser =  await this.appUsersService.createAppUser({
        name: registerAppUserDto.name,
        lastName: registerAppUserDto.lastName,      
        user: {
          username: registerAppUserDto.username,
          email: registerAppUserDto.email,
          roles: ['admin'], 
          externalIds: [
            {
              kcID:  kcId,
            },
          ],
        },
      });

      const clientID = this.alsService.get('decrypted-client-token').client_id
     const kcClient = await  this.getClientByName(clientID);
      const roles = await this.getClientRoles(kcClient.id);
      const role = roles.find((role) => role.name === registerAppUserDto.role);
    const addRoles =   await this.addRolesToUser({
        userKeycloakID: kcId,
        clientKeycloakID: kcClient.id,
        roles: role
      })

      //TODO: add history
      return newAppUser;
    } catch (error) {
      //TODO: add history
      console.log(error);
      throw new CustomErrorResponse(error);
    }
  }
  async login(
    loginDto: LoginDto,
    clientParams: { clientId: string; clientSecret: string },
  ) {
    // const storedAppUser = await this.appUsersService.findByUserCredentials(
    //   loginDto.credential,
    // );
    let userToken = await this.getUserToken({
      loginDto: {
        ...loginDto,
        password: decryptSecretKey(loginDto.password, this.cryptoSecretKey),
      },
      clientId: decryptSecretKey(clientParams.clientId, this.cryptoSecretKey),
      clientSecret: decryptSecretKey(
        clientParams.clientSecret,
        this.cryptoSecretKey,
      ),
    });
    //get the user from the token
    const storedAppUser = await this.appUsersService.findByUserCredentials(
      loginDto.credential,
    );


   await this.appUsersService.updateLastLogin(storedAppUser.user._id);

    return {
      ...userToken,
      appUserId: storedAppUser._id
    };
  }

  async logout(refreshToken: string, clientId, clientSecret) {
    try {
      await this.request.POST({
        endpoint: `${this.authBaseUrl}/realms/${this.realm}/protocol/openid-connect/logout`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          client_id: decryptSecretKey(clientId, this.cryptoSecretKey),
          client_secret: decryptSecretKey(clientSecret, this.cryptoSecretKey),
          refresh_token: refreshToken,
        },
      });
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async requestClientToken(requestClientTokenDto: RequestClientTokenDto) {
    try {
      const { clientId, clientSecret } = requestClientTokenDto;
      let response: any = await this.request.POST({
        endpoint: `${this.authBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          grant_type: 'client_credentials',
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

  async getUserByEmail(userEmail: string): Promise<any> {
    try {
      const adminToken: any = await this.redisService.get('own-platform-token');
      let response: any = await this.request.GET({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/users?email=${userEmail}&exact=true`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${adminToken.access_token}`,
        },
      });
      return response.data[0];
    } catch (error) {
      console.log(error);
    }
  }

  async verifyTokenSession(verifyTokenDto: VerifySessionDto): Promise<any> {
    try {
      let response: any = await this.request.POST({
        endpoint: `${this.authBaseUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
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
    password: string;
    email: string;
    username: string;
  }) {
    try {
      const adminToken: any = await this.redisService.get('own-platform-token');
      const { password, email, username } = user;
      let userData: any = {
        username: username || email.toLowerCase(),
        email: email.toLowerCase(),
        enabled: true, //TODO: enabled tiene que ser un campo de base de datos o variable de entorno
        emailVerified: true, //TODO: emailVerified tiene que ser un campo de base de datos o variable de entorno
      };
      if (password) {
        userData.credentials = [
          {
            type: 'password',
            value: password,
          },
        ];
      }
      let response: any = await this.request.POST({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/users`,
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${adminToken.access_token}`,
        },
        data: userData,
      });
      const kcId = response.headers['location'].split('/').pop();
      return kcId;
    } catch (error) {
      manageKeyCloakErrors(error);
    }
  }

  async getUserToken(params: {
    loginDto: LoginDto;
    clientId: string;
    clientSecret: string;
  }) {
    const { loginDto, clientId, clientSecret } = params;
    const { credential, password } = loginDto;
    try {
      let response: any = await this.request.POST({
        triggerError: false,
        endpoint: `${this.authBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          username: credential.toLowerCase(),
          password: password,
        },
      });
      return response.data;
    } catch (e) {
      console.log(e);
      manageKeyCloakErrors(e);
    }
  }

  async addRolesToUser(params: {
    userKeycloakID: string;
    clientKeycloakID: string;
    roles: any;
  }) {
    const { userKeycloakID, clientKeycloakID, roles } = params;
    try {
      const adminToken: any = await this.redisService.get('own-platform-token');

      let response = await this.request.POST({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/users/${userKeycloakID}/role-mappings/clients/${clientKeycloakID}`,
        headers: {
          Authorization: `Bearer ${adminToken.access_token}`,
          // 'Content-type': 'application/x-www-form-urlencoded',
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

  async getClientRoles(clientID: string) {
    try {
      const adminToken: any = await this.redisService.get('own-platform-token');
      let response: any = await this.request.GET({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/clients/${clientID}/roles`,
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${adminToken.access_token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(error);
    }
  }

  async getClients() {
    try {
      const adminToken: any = await this.redisService.get('own-platform-token');

      let response: any = await this.request.GET({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/clients`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${adminToken.access_token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(error);
    }
  }

  async getClientByName(id: string) {
    try {
      const adminToken: any = await this.redisService.get('own-platform-token');

      let response: any = await this.request.GET({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/clients?clientId=${id}`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${adminToken.access_token}`,
        },
      });
      return response.data[0];
    } catch (error: any) {
      console.log(error);
    }
  }

  async refreshToken(params: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<any> {
    try {
      const { refreshToken, clientId, clientSecret } = params;
      let response: any = await this.request.POST({
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

      return response.data;
    } catch (error) {
      //TODO: usar manageKeycloakErrors
      if (error.response.data.error_description === 'Token is not active') {
        throw new BadRequestCustomResponse({
          title: error.response.data.error_description,
          detail: error.response.data.error_description,
          key: CustomErrorKeys.REFRESH_TOKEN_NOT_VALID,
        });
      } else {
        throw new BadRequestCustomResponse({
          title: error.response.data.error_description,
          detail: error.response.data.error_description,
          key: CustomErrorKeys.INVALID_REFRESH_TOKEN,
        });
      }
    }
  }

  async verifyUserSession(access_token: string): Promise<any> {
    try {
      let response: any = await this.request.POST({
        endpoint: `${this.authBaseUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          token: access_token,
        },
      });
      //si está activo, retorna el token descifrado por keycloak, si no, retorna false
      return response.data.active ? response.data : false;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  async createResetPasswordSecurityCodeAndSendEmail(
    userCredentialsDto: ForgotPasswordDto,
  ) {
    try {
      const credential = userCredentialsDto.userCredential.toLowerCase();

      //1.- Buscar al usuario por las credenciales (username o email)

      const storedUser = await this.usersService.findOne({
        filterOptions: {
          $or: [{ username: credential }, { email: credential }],
        },
        populateOptions: ['configuration'],
      });
      //2.- Crear security code
      let securityCode = await this.securityCodesService.findValidSecurityCode(
        storedUser._id,
        SecurityCodeTypes.RESET_PASSWORD,
      );

      if (!securityCode) {
        securityCode = await this.securityCodesService.create({
          user: storedUser._id,
          status: SecurityCodeStatus.VALID,
          type: SecurityCodeTypes.RESET_PASSWORD,
          expireDate: nextDay(), //TODO: se recogera la fecha de expiración por la configuración del cliente
        });
      }

      this.securityCodesService.checkNumberOfEmailsSent(securityCode.emailSent);

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
      console.log("INSIDE UPDATE FORGOTTEN PASSWORD SERVICE");
      console.log("updateForgottenPasswordDto", updateForgottenPasswordDto);
      
      
      const { securityCodeId, newPassword } = updateForgottenPasswordDto;
      const securityCode =
        await this.securityCodesService.checkSecurityCode(securityCodeId);
        console.log("securityCode", securityCode);
        
      // TODO: Llamar al servicio Auth
      const keycloakUser = await this.getUserByEmail(securityCode.user.email);
      console.log("keycloakUser", keycloakUser);
      
      await this.updateUserPassword(keycloakUser.id, newPassword);

      //Ahora se expira el securityCode, para que no se pueda volver a usar
      await this.securityCodesService.update(securityCode.id, {
        emailSent: securityCode.emailSent + 1,
        status: SecurityCodeStatus.EXPIRED,
      });

      return securityCode;
    } catch (error) {
      console.log(error);
      
      throw new CustomErrorResponse(error);
    }
  }

  async updateUserPassword(userId: string, password: string): Promise<any> {
    try {
      const adminToken: any = await this.redisService.get('own-platform-token');

      //creates a custom config object for axios, to implement x-www-form-urlencoded
      const response = await this.request.PUT({
        endpoint: `${this.authBaseUrl}/admin/realms/${this.realm}/users/${userId}/reset-password`,
        data: {
          type: 'password',
          value: decryptSecretKey(password, this.cryptoSecretKey),
          temporary: false,
        },
        headers: {
          Authorization: `Bearer ${adminToken.access_token}`,
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
}
