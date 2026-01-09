import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class addReviewDto {
  @IsNumber()
  @IsNotEmpty()
  @Max(5)
  @Min(1)
  stars: number;
  @IsString()
  @IsOptional()
  @Length(4, 100)
  content: string;
}
