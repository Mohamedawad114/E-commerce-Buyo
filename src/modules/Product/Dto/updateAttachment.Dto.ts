import { IsArray, IsOptional, IsString } from 'class-validator';

export class updateAttachmentDTo {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removedImgs: string[];
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  addedImgs: string[];
}
