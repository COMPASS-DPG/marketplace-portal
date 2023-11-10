import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";
import { CourseInfoDto } from "./courseInfo.dto";

export class PurchaseCourseDto extends CourseInfoDto {
    // provider ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    providerId: string;
}

export class PurchaseDto {

    // provider ID
    readonly providerId: string;

    // Number of credits transferred
    readonly credits: number;
}