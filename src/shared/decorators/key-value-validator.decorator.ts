import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsKeyValueValidConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    for (const [key, val] of Object.entries(value)) {
      if (typeof key !== 'string' || typeof val !== 'string') {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'All keys and values in $property must be strings';
  }
}

export function IsKeyValueValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsKeyValueValidConstraint,
    });
  };
}
