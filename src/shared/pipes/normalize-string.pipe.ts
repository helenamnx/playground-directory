import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { normalizeString } from '../utils/utils';
/**
 * @description This pipe normalizes the string values of an object.
 * @author Damian
 * @date 12/06/2025
 * @class NormalizeStringPipe
 * @implements {PipeTransform}
 */
@Injectable()
export class NormalizeStringPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'object' || value === null) return value;

    const normalized = Object.entries(value).reduce((acc, [key, val]) => {
      // No normalizar el campo "username"
      if (key === 'username') {
        acc[key] = val;
      } else {
        acc[key] = typeof val === 'string' ? normalizeString(val) : val;
      }
      return acc;
    }, {} as any);

    return normalized;
  }
}
