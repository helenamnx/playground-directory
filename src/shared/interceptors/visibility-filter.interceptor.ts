import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncStorageService } from '../services/als/als.service';
import { AlsKeysEnum } from '../enums/als-keys.enum';
import { filterObjects, isUserAdmin, shouldFilterObject } from '../utils/utils';
import { BadRequestCustomResponse } from '../responses/error/custom-error-response';
import { CustomErrorKeys } from '../enums/error-keys.enum';

@Injectable()
export class VisibilityFilterInterceptor implements NestInterceptor {
  constructor(private readonly alsService: AsyncStorageService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = this.alsService.get(AlsKeysEnum.APP_USER);
    if (!user) return next.handle();
    //if the user is admin, return the data without filtering
    if (isUserAdmin(user)) {
      return next.handle();
    }
    const filterConditions = [
      {
        key: 'isVisible',
        value: false,
      },
      {
        key: 'isActive',
        value: false,
      },
    ];

    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return filterObjects(data, filterConditions);
        } else {
          if (shouldFilterObject(data, filterConditions)) {
            throw new BadRequestCustomResponse({
              title: 'Object is not visible or not active',
              key: CustomErrorKeys.OBJECT_IS_HIDDEN,
              detail: 'Object is not visible or not active',
            });
          }
          return data;
        }
      }),
    );
  }
}
