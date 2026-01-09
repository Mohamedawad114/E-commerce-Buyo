import { IsNotEmpty, IsString, Length } from "class-validator";
import { IBrand } from "src/common";


export class createBrandDto implements Partial< IBrand> {
  @IsString()
  @Length(2, 25)
  @IsNotEmpty()
  name: string;
  @IsString()
  @Length(2, 100)
  @IsNotEmpty()
  slogan: string;
  @IsString()
  @IsNotEmpty()
    logo: string;
}