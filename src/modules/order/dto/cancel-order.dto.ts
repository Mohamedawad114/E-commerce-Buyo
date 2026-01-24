import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class cancelOrderDto {
  @ApiProperty({
    description: 'Reason for cancelling the order',
    example: 'Customer requested cancellation',
  })
  @IsString()
  @IsNotEmpty()
  cancelReson: string;

  @ApiProperty({
    description: 'Security key for verifying the cancellation',
    example: 'a1b2c3d4e5f6',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
