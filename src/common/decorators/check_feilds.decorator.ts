import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'check feilds', async: false })
export class checkAnyFeildsAreApplied implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return (
      Object.keys(args.object).length > 0 &&
      Object.values(args.object).filter((arg) => {
        return arg !== undefined;
      }).length > 0
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `update feilds must have one value at least`;
  }
}

export function AllFeildsApllied(
  validationOptions?: ValidationOptions,
) {
  return function (constructor: Function) {
    registerDecorator({
      target: constructor,
      propertyName: undefined!,
      options: validationOptions,
      constraints: [],
      validator: checkAnyFeildsAreApplied,
    });
  };
}
