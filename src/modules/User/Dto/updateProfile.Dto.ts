import {
  IsString,
  Length,
  IsEmail,
  MinLength,
  IsEnum,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, IUser } from 'src/common';

export class updateProfileDto implements Partial<IUser> {
  @ApiPropertyOptional({
    example: 'mohamed_awad',
    minLength: 4,
    maxLength: 50,
  })
  @IsString()
  @Length(4, 50)
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    example: 'mohamed@test.com',
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 25,
    minimum: 16,
  })
  @IsNumber()
  @Min(16)
  @IsOptional()
  Age?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Email confirmation status',
  })
  @IsBoolean()
  @IsOptional()
  isConfirmed?: boolean;

  @ApiPropertyOptional({
    example: '01012345678',
    minLength: 11,
  })
  @IsString()
  @MinLength(11)
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.male,
  })
  @IsString()
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;
}
