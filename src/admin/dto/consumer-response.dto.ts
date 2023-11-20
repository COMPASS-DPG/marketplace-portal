import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

// Might Need to change based on what data to show on Admin UI for every consumer
export class ConsumerDtoResponse {

    // consumer ID
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    consumerId: string;

    @ApiProperty()
    @IsArray()
    savedCourses: number[];
}