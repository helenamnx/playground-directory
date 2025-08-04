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

@Global()
@Injectable()
export class UserTokenGuard implements CanActivate {
  // Injects the reflector to retrieve metadata from the route handler.
  constructor(
    private reflector: Reflector,
    private readonly alsService: AsyncStorageService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest();

    const user = this.alsService.get('user');
    if (!user) {
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
    const scope = this.reflector.get<string>('scope', context.getHandler());
    const roles = this.reflector.get<string>('roles', context.getHandler());
    console.log(user);
    if (
      roles &&
      !user.roles.some((role) => roles.includes(role.toLowerCase()))
    ) {
      throw new UnauthorizedCustomResponse({
        title: 'User does not has permissions',
        key: CustomErrorKeys.UNAUTHORIZED,
        detail: 'User does not has permissions',
      });
    }

    return true;
  }
}
