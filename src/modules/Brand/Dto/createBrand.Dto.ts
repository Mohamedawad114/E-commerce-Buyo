import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IBrand } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class createBrandDto implements Partial<IBrand> {
  @ApiProperty({
    example: 'Apple',
    description: 'Brand name',
    minLength: 2,
    maxLength: 25,
  })
  @IsString()
  @Length(2, 25)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Think Different',
    description: 'Brand slogan',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  @IsNotEmpty()
  slogan: string;

  @ApiProperty({
    example: 'https://mybucket.s3.amazonaws.com/logo.png',
    description: 'Brand logo URL',
  })
  @IsString()
  @IsNotEmpty()
  logo: string;
}
