import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator'

@ValidatorConstraint({ name: 'isLessThan', async: false })
export class IsLessThanConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [secondPropertyName] = args.constraints
    const secondValue = (args.object as any)[secondPropertyName]
    if (value !== undefined && secondValue !== undefined) {
      return value < secondValue // strict inequality
    }
    return true
  }

  defaultMessage(args: ValidationArguments) {
    const [secondPropertyName] = args.constraints
    return `$property must be less than ${secondPropertyName}`
  }
}

export function IsLessThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsLessThanConstraint,
    })
  }
}
