import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({name:"match between two feilds", async: false })
export class MatchConstraint<T> implements ValidatorConstraintInterface {
  validate(value:T , args: ValidationArguments) {
    const object = args.object as any;
    return value === object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must match ${args.constraints[0]}`;
  }
}

export function IsMatch(constraints:string[],validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: constraints,
      validator: MatchConstraint,
    });
  };
}
