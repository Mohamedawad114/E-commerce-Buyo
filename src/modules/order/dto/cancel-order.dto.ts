import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class cancelOrderDto {
  @IsString()
  @IsNotEmpty()
  cancelReson: string;
  @IsString()
  @IsNotEmpty()
  key: string;
}
