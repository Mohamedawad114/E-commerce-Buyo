import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Types } from 'mongoose';

export class TwoFADto {
  @IsString()
  @Length(6)
  @IsNotEmpty()
  code: string;
}
export class VerifyTwoFADto extends TwoFADto {
  @IsString()
  @IsNotEmpty()
    @Length(24)
  userId: string|Types.ObjectId;
}
