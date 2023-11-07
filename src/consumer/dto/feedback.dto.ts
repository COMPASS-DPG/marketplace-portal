import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class FeedbackDto {

    // course ID
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    courseId: number;

    //  Feedback Text
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    feedback: string;

    //  Integer rating of the course
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    rating: number;
}