import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Min, IsInt, IsArray, IsUrl, IsUUID } from "class-validator";

export class CourseInfoDto {

    // course ID
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    courseId: number;
    
    // course BPP ID
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    bppId: string;
    
    // course title
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;
    
    // course description
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;
    
    // credits required to purchase the course
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    credits: number;
    
    // course display image link
    @ApiProperty()
    @IsNotEmpty()
    @IsUrl()
    imageLink: string;
    
    // list of languages the course is available in
    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    language: string[];
    
    // link for the course content
    @ApiProperty()
    @IsNotEmpty()
    @IsUrl()
    courseLink: string;
    
    // name of course provider
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    providerName: string;
}