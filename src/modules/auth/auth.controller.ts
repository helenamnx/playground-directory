import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  HttpCode,
  Req,
  HttpStatus,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { UnauthorizedCustomResponse } from '@/shared/responses/error/custom-error-response';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { RefresTokenDTO } from './dto/refresh-token.dto';
import { decryptSecretKey, encryptString } from '@/shared/utils/crypto.utils';
import { ConfigService } from '@nestjs/config';
import { RegisterAppUserDto } from '../app-users/dto/register-app-user.dto';
import { AppUsersService } from '../app-users/app-users.service';
import { getLastArrayItem, normalizeString } from '@/shared/utils/utils';
import { NormalizeStringPipe } from '@/shared/pipes/normalize-string.pipe';
import { ModerateUserRegistrationDto } from './dto/moderate-user-registration.dto';
import { HeaderKeysEnum } from '@/shared/enums/headers.enum';
import { JsonFetcherService } from '@/shared/services/json-fetcher/json-fetcher.service';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import {
  Resource,
  Roles,
  UserScope,
} from '@/shared/decorators/user-scopes.decorator';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import {
  UpdateForgottenPassword,
  UpdateUserPassword,
} from './dto/update-forgotten.password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import resourcesJson from '@/shared/json/resources.json';
import scopesJson from '@/shared/json/scopes.json';
import { MessagesService } from '../messages/messages.service';
import { UpdateAppUserDto } from '../app-users/dto/update-app-user.dto';
import { ModerationStatusAliasEnum } from '@/shared/enums/moderation-status.enum';

const { OK, CREATED } = HttpStatus;
@Controller('auth')
export class AuthController {
  private readonly cryptoSecretKey: string;
  private roles: any;
  constructor(
    private readonly authService: AuthService,
    private readonly alsService: AsyncStorageService,
    private readonly configService: ConfigService,
    private readonly appUsersService: AppUsersService,
    private readonly jsonFetcherService: JsonFetcherService,
    private readonly messagesService: MessagesService,
  ) {
    this.cryptoSecretKey = this.configService.get<string>(
      'crypto.CRYPTO_SECRET_KEY',
    );
  }

  @HttpCode(CREATED)
  @Post('register')
  register(
    @Req() req: any,
    @Body(new NormalizeStringPipe()) registerAppUserDto: RegisterAppUserDto,
  ) {
    const storedAppUser = this.alsService.get(AlsKeysEnum.APP_USER);
    const storedClient = this.alsService.get(AlsKeysEnum.CLIENT);
    return this.authService.registerAppUser({
      registerAppUserDto,
      storedAppUser,
      storedClient,
    });
  }

  @Post('logout')
  @HttpCode(OK)
  @UseGuards(UserTokenGuard) // guard to check if the user is authenticated
  logout(@Req() req: any) {
    const storedUser = this.alsService.get(AlsKeysEnum.APP_USER);
    const storedClient = this.alsService.get(AlsKeysEnum.CLIENT);

    return this.authService.clearSessions(storedUser, storedClient);
  }

  @HttpCode(OK)
  @Post('client-token')
  requestClientToken(@Req() req: any) {
    const clientId = req.headers[HeaderKeysEnum.CLIENT_ID];
    const clientSecret = req.headers[HeaderKeysEnum.CLIENT_SECRET];
    return this.authService.requestClientToken({
      clientId: decryptSecretKey(clientId, this.cryptoSecretKey),
      clientSecret: decryptSecretKey(clientSecret, this.cryptoSecretKey),
    });
  }

  @Get('/check-registration')
  async checkIfUserAlreadyExists(
    @Query('email') email: string,
    @Query('username') username: string,
    @Query('dni') dni: string,
    @Query('memberNumber') memberNumber: string,
  ) {
    return {
      isUserAlreadyRegistered:
        await this.appUsersService.isUserAlreadyRegistered({
          email: email ? normalizeString(email) : null,
          username: username ? normalizeString(username) : null,
          dni: dni ? dni.trim() : null, //Only trim the dni
          memberNumber: memberNumber ? normalizeString(memberNumber) : null,
        }),
    };
  }

  @HttpCode(OK)
  @Patch('moderate-user-registration')
  @Roles([RolesEnum.ADMINISTRATOR])
  @Resource(resourcesJson.Users)
  @UserScope(scopesJson['users:moderate'])
  @UseGuards(UserTokenGuard)
  async moderateUserRegistrationDto(
    @Body()
    moderateUserRegistrationDto: ModerateUserRegistrationDto,
  ) {
    const client = this.alsService.get(AlsKeysEnum.CLIENT);
    const {
      MODERATION_EMAIL_RESENT,
      MODERATION_REJECTED,
      MODERATION_APPROVED,
      USER_ACTIVATED,
      USER_DEACTIVATED,
    } = ModerationStatusAliasEnum;
    const newStatus = moderateUserRegistrationDto.status;

    const observation = moderateUserRegistrationDto.observation;

    //first, moderate the user registration
    const appUserModerated = await this.authService.moderateUserRegistration(
      moderateUserRegistrationDto,
      client,
    );

    switch (newStatus) {
      case MODERATION_APPROVED: {
        const { securityCode } =
          await this.authService.createResetPasswordSecurityCodeAndSendEmail(
            {
              userCredential: appUserModerated.user.email,
            },
            true,
          );

        await this.messagesService.sendUserRegistrationApproved(
          appUserModerated,
          client,
          securityCode,
        );
        return;
      }
      case MODERATION_REJECTED: {
        return this.messagesService.sendDeniedRegistrationMessage(
          observation
            ? observation[client.configuration.defaultLanguage] || ''
            : '',
          client,
          appUserModerated,
        );
      }
      case MODERATION_EMAIL_RESENT: {
        const { securityCode } =
          await this.authService.createResetPasswordSecurityCodeAndSendEmail(
            {
              userCredential: appUserModerated.user.email,
            },
            true,
          );
        return this.messagesService.sendVerifyEmailMessageAsAdmin(
          appUserModerated,
          client,
          securityCode,
        );
      }
      case USER_ACTIVATED: {
        return this.messagesService.sendUserActivatedMessage(
          appUserModerated,
          client,
        );
      }
      case USER_DEACTIVATED: {
        return this.messagesService.sendUserDeactivationMessage(
          appUserModerated,
          client,
          observation
            ? observation[client.configuration.defaultLanguage] || ''
            : '',
        );
      }
    }

    return { message: 'User moderated successfully' };
  }

  @Put('app-user')
  // @Roles([RolesEnum.ADMINISTRATOR])
  // @Resource(resourcesJson.Users)
  // @UserScope(scopesJson['users:moderate'])
  @UseGuards(UserTokenGuard)
  updateUser(@Body() updateAppUserDto: UpdateAppUserDto) {
    const client = this.alsService.get(AlsKeysEnum.CLIENT);
    const requesterUser = this.alsService.get(AlsKeysEnum.APP_USER);
    return this.authService.updateAppUser(
      updateAppUserDto,
      client,
      requesterUser,
    );
  }

  @Post('login')
  @HttpCode(OK)
  login(@Body() loginDto: LoginDto, @Req() req: any) {
    //fetch the errors from the json file
    const errors = this.jsonFetcherService.fetchErrors([
      HttpStatus.UNAUTHORIZED,
    ]);
    const clientId = req.headers[HeaderKeysEnum.CLIENT_ID];
    const clientSecret = req.headers[HeaderKeysEnum.CLIENT_SECRET];
    const client = this.alsService.get(AlsKeysEnum.CLIENT);

    //check if the client id and client secret are provided
    if (!clientId || !clientSecret) {
      throw new UnauthorizedCustomResponse(
        errors[401][CustomErrorKeys.MISSING_CLIENT_CREDENTIALS],
      );
    }

    return this.authService.login(
      {
        ...loginDto,
        password: decryptSecretKey(loginDto.password, this.cryptoSecretKey),
      },
      decryptSecretKey(clientId, this.cryptoSecretKey),
      decryptSecretKey(clientSecret, this.cryptoSecretKey),
      client,
    );
  }

  @HttpCode(OK)
  @Post('refresh-token')
  async refreshToken(@Req() req: any, @Body() refreshTokenDto: RefresTokenDTO) {
    if (!req.headers['client-id'] || !req.headers['client-secret']) {
      throw new UnauthorizedCustomResponse({
        title: 'Missing client-id or client-secret',
        key: CustomErrorKeys.MISSING_CLIENT_CREDENTIALS,
        detail: 'Missing client-id or client-secret',
      });
    }
    const clientId = req.headers['client-id'];
    const clientSecret = req.headers['client-secret'];
    let newToken = await this.authService.refreshToken({
      refreshToken: refreshTokenDto.refreshToken,
      clientId: clientId,
      clientSecret: clientSecret,
    });

    return newToken;
  }

  @Post('password/forgot')
  @HttpCode(OK)
  async forgotPassword(@Body() userForgotPassword: ForgotPasswordDto) {
    const client = this.alsService.get(AlsKeysEnum.CLIENT); //TODO: add client entrypoints

    const { securityCode, storedUser } =
      await this.authService.createResetPasswordSecurityCodeAndSendEmail(
        userForgotPassword,
      );

    await this.messagesService.sendResetPasswordMessage(
      storedUser,
      securityCode,
      client,
    );

    return { message: 'Email sent' };
  }

  @Patch('password/reset')
  @HttpCode(OK)
  async updateForgottenPassword(
    @Body() updateForgottenPassword: UpdateForgottenPassword,
  ) {
    const storedSecurityCode = await this.authService.updateForgottenPassword(
      updateForgottenPassword,
    );
    await this.messagesService.sendPasswordUpdatedMessage(
      storedSecurityCode.user,
      this.alsService.get(AlsKeysEnum.CLIENT),
    );

    return { message: 'Password updated' };
  }

  @Roles([RolesEnum.ADMINISTRATOR])
  @UseGuards(UserTokenGuard)
  @Patch('password/update')
  @HttpCode(OK)
  async updatePassword(@Body() updateUserPassword: UpdateUserPassword) {
    const { sendEmail, appUserId, newPassword } = updateUserPassword;
    //find the appUser
    const storedAppUser = await this.appUsersService.findOne({
      filterOptions: {
        _id: appUserId,
      },
      populateOptions: [{ path: 'user', populate: ['configuration'] }],
    });
    //then, find the user in keycloak
    const keycloakUser = await this.authService.getUsers(
      storedAppUser.user.username,
    );
    //update the user password
    await this.authService.updateUserPassword(
      keycloakUser.id,
      decryptSecretKey(newPassword, this.cryptoSecretKey),
    );

    if (sendEmail) {
      //send the email to the user
      await this.messagesService.sendPasswordUpdatedByAdmin(
        storedAppUser.user,
        this.alsService.get(AlsKeysEnum.CLIENT),
      );
    }
    return { message: 'Password updated' };
  }
}
