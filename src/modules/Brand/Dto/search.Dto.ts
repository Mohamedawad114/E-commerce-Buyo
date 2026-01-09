import { IsNotEmpty, IsString } from 'class-validator';

export class searchDto {
  @IsString()
  @IsNotEmpty()
  search: string;
}
