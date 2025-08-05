import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Global,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UnauthorizedCustomResponse } from '../responses/error/custom-error-response';
import { CustomErrorKeys } from '../enums/error-keys.enum';
import { AsyncStorageService } from '../services/als/als.service';
import { AlsKeysEnum } from '../enums/als-keys.enum';
import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { checkCapabilities } from '../utils/utils';
import { AuthService } from '@/modules/auth/auth.service';
import { Client } from '@/modules/clients/schemas/client.schema';

@Global()
@Injectable()
export class UserTokenGuard implements CanActivate {
  // Injects the reflector to retrieve metadata from the route handler.
  constructor(
    private reflector: Reflector,
    private readonly alsService: AsyncStorageService,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest();

    const appUser: AppUser = this.alsService.get(AlsKeysEnum.APP_USER);
    const client: Client = this.alsService.get(AlsKeysEnum.CLIENT);
    if (!appUser) {
      throw new UnauthorizedCustomResponse({
        title: 'User token must be provided',
        key: CustomErrorKeys.MISSING_USER_TOKEN,
        detail: 'User token must be provided',
      });
    }
    const resource = this.reflector.get<string>(
      'resource',
      context.getHandler(),
    );
    const scope = this.reflector.get<string[]>('scope', context.getHandler());
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (roles && roles.length > 0) {
      checkCapabilities({
        appUser: appUser,
        roles: roles,
      });
    }

    // if (resource && scope) {
    //   const isPermitted = await this.authService.checkUserPermissions({
    //     accessToken: request.headers['authorization'].split(' ')[1], //this gets the access token without the Bearer prefix
    //     permission: `${resource}#${scope}`,
    //     clientId: client.clientId,
    //   });
    //   if (!isPermitted) {
    //     throw new UnauthorizedCustomResponse({
    //       title: 'User does not have permissions',
    //       key: CustomErrorKeys.UNAUTHORIZED,
    //       detail: 'User does not have permissions',
    //     });
    //   }
    // }

    return true;
  }
}
