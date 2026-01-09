import {
  IsString,
  IsNotEmpty,
  Length,
  IsEmail,
  IsStrongPassword,
  Matches,
  IsDate,
  MinLength,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Gender, IsMatch, IUser, Sys_Role } from 'src/common';

export class SignUpDto implements Partial<IUser> {
  @IsString()
  @IsNotEmpty()
  @Length(4, 50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 64)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number and special character',
    },
  )
  @IsStrongPassword()
  password: string;

  @IsString()
  @Length(8, 64)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number and special character',
    },
  )
  @IsStrongPassword()
  @IsMatch(['password'])
  confirmPassword: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(16)
  Age: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  phoneNumber: string;

  @IsString()
  @IsEnum(Gender)
  gender: Gender;
  @IsEnum(Sys_Role)
  role?: Sys_Role;
}
