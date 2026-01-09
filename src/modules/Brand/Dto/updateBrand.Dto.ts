import { IsOptional, IsString, Length } from 'class-validator';

import { AllFeildsApllied, IBrand } from 'src/common';
@AllFeildsApllied()
export class updateBrandDto implements Partial<IBrand> {
  @IsString()
  @Length(2, 25)
  @IsOptional()
  name: string;
  @IsString()
  @Length(2, 100)
  @IsOptional()
  slogan: string;
  @IsString()
  @IsOptional()
  logo: string;
}

