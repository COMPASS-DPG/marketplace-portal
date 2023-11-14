import { ApiProperty } from "@nestjs/swagger";
import {  IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {

    // email ID
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string

    // password
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string
}

export class LoginResponseDto {

    // provider ID
    readonly providerId: number
}