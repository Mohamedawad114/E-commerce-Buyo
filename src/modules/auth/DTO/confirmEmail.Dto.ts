import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailDto {
  @ApiProperty({
    example: 'mohamed@test.com',
    description: 'User email to confirm',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code sent to user email',
  })
  @IsString()
  @IsAlphanumeric()
  @IsNotEmpty()
  OTP: string;
}
