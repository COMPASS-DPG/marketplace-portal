import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Min, IsInt, IsArray, IsUrl, IsUUID, ArrayNotEmpty } from "class-validator";

export class CourseInfoDto {

    // course ID
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    courseId: number;
    
    // course BPP ID
    @IsNotEmpty()
    @IsString()
    bppId: string;
    
    // course title
    @IsNotEmpty()
    @IsString()
    title: string;
    
    // course description
    @IsNotEmpty()
    @IsString()
    description: string;
    
    // credits required to purchase the course
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    credits: number;
    
    // course display image link
    @IsNotEmpty()
    @IsUrl()
    imageLink: string;
    
    // list of languages the course is available in
    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    language: string[];
    
    // link for the course content
    @IsNotEmpty()
    @IsUrl()
    courseLink: string;
    
    // name of course provider
    @IsNotEmpty()
    @IsString()
    providerName: string;
}

export class UnsaveCourseDto extends PartialType(CourseInfoDto) {

}