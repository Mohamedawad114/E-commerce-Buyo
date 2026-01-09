import { IsString, IsNotEmpty,  } from 'class-validator';

export class signupByProviderDTO {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}