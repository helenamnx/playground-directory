import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { UnauthorizedCustomResponse } from '@/shared/responses/error/custom-error-response';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { decodeToken } from '@/shared/utils/token.utils';
import { LogOutDto } from './dto/log-out.dto';
import { RefresTokenDTO } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UpdateForgottenPassword } from './dto/update-forgotten.password.dto';
import { decryptSecretKey, encryptString } from '@/shared/utils/crypto.utils';
import { ConfigService } from '@nestjs/config';
import { PlatformsService } from '../platforms/platforms.service';
import { EmailsService } from '../emails/emails.service';
import { RegisterAppUserDto } from '../app-users/dto/register-app-user.dto';

@Controller('auth')
export class AuthController {
  private readonly cryptoSecretKey: string;

  constructor(
    private readonly authService: AuthService,
    private readonly alsService: AsyncStorageService,
    private readonly configService: ConfigService,
    private readonly platformsService: PlatformsService,
    private readonly emailsService: EmailsService,
  ) {
    this.cryptoSecretKey = this.configService.get<string>(
      'crypto.CRYPTO_SECRET_KEY',
    );
  }


  @Post("register")
  register(@Req() req: any, @Body() registerAppUserDto: RegisterAppUserDto) {        
    return this.authService.registerAppUser(registerAppUserDto,);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: any, @Body() logoutDto: LogOutDto) {
    if (!req.headers['client-id'] || !req.headers['client-secret']) {
      throw new UnauthorizedCustomResponse({
        title: 'Missing client-id or client-secret',
        key: CustomErrorKeys.MISSING_CLIENT_CREDENTIALS,
        detail: 'Missing client-id or client-secret',
      });
    }

    return this.authService.logout(
      logoutDto.refreshToken,
      req.headers['client-id'],
      req.headers['client-secret'],
    );
  }

  @Post('client-token')
  requestClientToken(@Req() req: any) {
    return this.authService.requestClientToken({
      clientId: decryptSecretKey(
        req.headers['client-id'],
        this.cryptoSecretKey,
      ),
      clientSecret: decryptSecretKey(
        req.headers['client-secret'],
        this.cryptoSecretKey,
      ),
    });
  }

  @Post('login')
  @HttpCode(200) //Changed to 200 from 201
  login(@Body() loginDto: LoginDto, @Req() req: any) {
    if (!req.headers['client-id'] || !req.headers['client-secret']) {
      throw new UnauthorizedCustomResponse({
        title: 'Missing client-id or client-secret',
        key: CustomErrorKeys.MISSING_CLIENT_CREDENTIALS,
        detail: 'Missing client-id or client-secret',
      });
    }
    return this.authService.login(loginDto, {
      clientId: req.headers['client-id'],
      clientSecret: req.headers['client-secret'],
    });
  }

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

  @Post('forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() userForgotPassword: ForgotPasswordDto) {
    const { securityCode, storedUser } =
      await this.authService.createResetPasswordSecurityCodeAndSendEmail(
        userForgotPassword,
      );

    const platform = await this.platformsService.getOwnPlatform();

    const emailsService = platform.services.find(
      (p) => p.technology === 'email',
    );

    //TODO: refactor && make object dynamic
    if (emailsService) {
      try {
        this.emailsService.sendEmail({
          platform: emailsService,
          sender: platform.email,
          subject: 'Reset password', //TODO: quitar string mágico
          emailType: 'forgot-password', //TODO: quitar string mágico
          language: storedUser.configuration.defaultLanguage,
          recipients: [
            {
              email: storedUser.email,
              variables: {
                url: `${process.env.CLIENT_FORGOT_URL}/${securityCode._id}`, //TODO: change url from database
              },
            },
          ],
          bccRecipients: [],
          ccRecipients: [],
        });
      } catch (e) {
        //TODO: comprobar error
        throw e;
      }
      return { message: 'Email sent' };
    }
  }

  @Patch('forgot/new')
  @HttpCode(HttpStatus.OK)
  async updateForgottenPassword(
    @Body() updateForgottenPassword: UpdateForgottenPassword,
  ) {
    console.log("INSIDE UPDATE FORGOTTEN PASSWORD CONTROLLER");
    
    console.log("🚀 ~ AuthController ~ updateForgottenPassword:", updateForgottenPassword)
    const storedSecurityCode = await this.authService.updateForgottenPassword(
      updateForgottenPassword,
    );
    console.log("🚀 ~ AuthController ~ storedSecurityCode:", storedSecurityCode)
    const platform = await this.platformsService.getOwnPlatform();
    console.log("🚀 ~ AuthController ~ platform:", platform)

    const emailsService = platform.services.find(
      (p) => p.technology === 'email',
    );
    console.log("🚀 ~ AuthController ~ emailsService:", emailsService)

    //TODO: refactor && make object dynamic
    if (emailsService) {
      try {
        this.emailsService.sendEmail({
          platform: emailsService,
          sender: platform.email,
          subject: 'Contraseña actualizada correctamente', //TODO: quitar string mágico
          emailType: 'password-updated', //TODO: quitar string mágico
          language: storedSecurityCode.user.configuration.defaultLanguage,
          recipients: [
            {
              email: storedSecurityCode.user.email,
            },
          ],
          bccRecipients: [],
          ccRecipients: [],
        });
      } catch (e) {
        throw e;
      }
    }

    return { message: 'Password updated' };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async test(@Body() string: any) {
    return encryptString(string.string);
  }
}
