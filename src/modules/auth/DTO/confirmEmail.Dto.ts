import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString } from "class-validator";


export class ConfirmEmailDto{

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string
    
    @IsString()
    @IsAlphanumeric()
    @IsNotEmpty()
    OTP:string
}