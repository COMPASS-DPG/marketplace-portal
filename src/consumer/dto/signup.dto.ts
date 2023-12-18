import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsUUID } from "class-validator";

export class ConsumerSignupDto {

    @IsNotEmpty()
    @IsUUID()
    consumerId: string;

    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;
}
