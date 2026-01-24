import {
  IsString,
  IsNotEmpty,
  Length,
  IsStrongPassword,
  Matches,
  IsAlphanumeric,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMatch } from 'src/common';

export class updatePasswordDto {
  @ApiProperty({
    example: 'OldP@ssw0rd!',
    description: 'Current user password',
  })
  @IsString()
  @Length(8, 64)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsStrongPassword()
  oldPassword: string;

  @ApiProperty({
    example: 'NewP@ssw0rd!',
    description: 'New password',
  })
  @IsString()
  @Length(8, 64)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({
    example: 'NewP@ssw0rd!',
    description: 'Must match newPassword',
  })
  @IsString()
  @Length(8, 64)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsStrongPassword()
  @IsMatch(['newPassword'])
  confirmPassword: string;
}
export class resetPasswordDto {
  @ApiProperty({
    example: '123456',
    description: 'OTP code sent to user email',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsAlphanumeric()
  @IsNotEmpty()
  @Length(6)
  OTP: string;

  @ApiProperty({
    example: 'NewP@ssw0rd!',
    description: 'New password',
  })
  @IsString()
  @Length(8, 64)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({
    example: 'NewP@ssw0rd!',
    description: 'Must match newPassword',
  })
  @IsString()
  @Length(8, 64)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsStrongPassword()
  @IsMatch(['newPassword'])
  confirmPassword: string;
}