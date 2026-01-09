import { IsString, IsNotEmpty, Length, IsEmail, IsStrongPassword, Matches, MinLength, IsEnum, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';
import { Gender, IUser } from 'src/common';

export class updateProfileDto implements Partial <IUser> {
  @IsString()
  @Length(4, 50)
  @IsOptional()
  username: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @IsNumber()
  @Min(16)
  @IsOptional()
  Age: number;
  @IsBoolean()
  @IsOptional()
  isConfirmed: boolean;

  @IsString()
  @MinLength(11)
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;
}
