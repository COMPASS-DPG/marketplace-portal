import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FeedbackDto {

    // course ID in the marketplace
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    courseInfoId: number;

    //  Feedback Text
    @ApiProperty()
    @IsOptional()
    @IsString()
    feedback?: string;

    //  Integer rating of the course
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    rating: number;
}

export class RatingRequestDto {

    // course ID as in the bpp
    courseId: string;

    //  Integer rating of the course
    rating: number;
    
    // course BPP id
    bppId: string;
    
    // course BPP URI
    bppUri: string;
}