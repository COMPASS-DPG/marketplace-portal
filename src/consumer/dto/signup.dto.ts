import { IsEmail, IsNotEmpty, IsPhoneNumber, IsUUID } from "class-validator";

export class ConsumerSignupDto {

    @IsNotEmpty()
    @IsUUID()
    consumerId: string;
    
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;
}
