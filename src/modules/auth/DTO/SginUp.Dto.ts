import {
  IsString,
  IsNotEmpty,
  Length,
  IsEmail,
  IsStrongPassword,
  Matches,
  MinLength,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, IsMatch, IUser, Sys_Role } from 'src/common';

export class SignUpDto implements Partial<IUser> {
  @ApiProperty({
    example: 'mohamed_awad',
    minLength: 4,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 50)
  username: string;

  @ApiProperty({
    example: 'mohamed@test.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description:
      'Must contain uppercase, lowercase, number and special character',
    minLength: 8,
    maxLength: 64,
  })
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

  @ApiProperty({
    example: 'P@ssw0rd!',
    description: 'Must match password',
  })
  @IsString()
  @Length(8, 64)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsStrongPassword()
  @IsMatch(['password'])
  confirmPassword: string;

  @ApiProperty({
    example: 25,
    minimum: 16,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(16)
  Age: number;

  @ApiProperty({
    example: '01012345678',
    minLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  phoneNumber: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.male,
  })
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({
    enum: Sys_Role,
    example: Sys_Role.user,
  })
  @IsEnum(Sys_Role)
  role?: Sys_Role;
}
