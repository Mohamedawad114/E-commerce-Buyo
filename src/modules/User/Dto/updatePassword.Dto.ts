import {
  IsString,
  IsNotEmpty,
  Length,
  IsStrongPassword,
  Matches,
  IsAlphanumeric,
} from 'class-validator';
import { IsMatch } from 'src/common';

export class updatePasswordDto {
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
  oldPassword: string;
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
  newPassword: string;

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
  @IsMatch(['newPassword'])
  confirmPassword: string;
}
export class resetPasswordDto {
  @IsString()
  @IsAlphanumeric()
  @IsNotEmpty()
  @Length(6)
  OTP: string;

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
  newPassword: string;

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
  @IsMatch(['newPassword'])
  confirmPassword: string;
}
