import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator'

@ValidatorConstraint({ name: 'isMinMaxBothPresent', async: false })
export class IsMinMaxBothPresentConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any
    if (
      (object.min !== undefined && object.max === undefined) ||
      (object.min === undefined && object.max !== undefined)
    ) {
      return false
    }
    return true
  }

  defaultMessage() {
    return 'Both min and max parameters must be provided together.'
  }
}
export function IsMinMaxBothPresent(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMinMaxBothPresentConstraint,
    })
  }
}
