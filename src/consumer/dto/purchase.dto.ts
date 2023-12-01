import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";
import { CourseInfoDto } from "./courseInfo.dto";


export class PurchaseDto {

    // Consumer ID
    readonly consumerId: string;
    
    // Purchase description
    readonly transactionDescription: string;

}