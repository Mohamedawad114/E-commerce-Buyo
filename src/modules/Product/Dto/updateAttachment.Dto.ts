import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class updateAttachmentDTo {
  @ApiPropertyOptional({
    example: ['https://bucket.com/img1.png', 'https://bucket.com/img2.png'],
    description: 'Array of image URLs to remove from the product',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removedImgs: string[];

  @ApiPropertyOptional({
    example: ['https://bucket.com/new1.png', 'https://bucket.com/new2.png'],
    description: 'Array of image URLs to add to the product',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  addedImgs: string[];
}
