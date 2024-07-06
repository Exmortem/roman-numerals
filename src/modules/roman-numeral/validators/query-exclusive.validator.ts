import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator'

@ValidatorConstraint({ name: 'isQueryExclusive', async: false })
export class IsQueryExclusiveConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any
    if (
      object.query !== undefined &&
      (object.min !== undefined || object.max !== undefined)
    ) {
      return false
    }
    return true
  }

  defaultMessage() {
    return 'If the query parameter is provided, min and max should not be present.'
  }
}

export function IsQueryExclusive(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsQueryExclusiveConstraint,
    })
  }
}
