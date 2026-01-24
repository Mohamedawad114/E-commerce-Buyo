import { IsOptional, IsString, Length } from 'class-validator';
import { AllFeildsApllied, IBrand } from 'src/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

@AllFeildsApllied()
export class updateBrandDto implements Partial<IBrand> {
  @ApiPropertyOptional({
    example: 'Apple',
    description: 'Brand name',
    minLength: 2,
    maxLength: 25,
  })
  @IsString()
  @Length(2, 25)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Think Different',
    description: 'Brand slogan',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  @IsOptional()
  slogan?: string;

  @ApiPropertyOptional({
    example: 'https://mybucket.s3.amazonaws.com/logo.png',
    description: 'Brand logo URL',
  })
  @IsString()
  @IsOptional()
  logo?: string;
}
