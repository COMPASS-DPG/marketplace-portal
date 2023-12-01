import { JsonValue } from "@prisma/client/runtime/library";
import { IsNotEmpty, IsString, Min, IsInt, IsArray, IsUrl, ArrayNotEmpty, IsNumber, IsOptional, IsObject } from "class-validator";
import { CompetencyMap } from "src/utils/types";

export class CourseInfoDto {

    // course ID
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    courseId: number;
    
    // course BPP URL
    @IsOptional()
    @IsString()
    bppUrl?: string;
    
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

    // name of course author
    @IsNotEmpty()
    @IsString()
    author: string;

    // average rating of the course
    @IsOptional()
    @IsNumber()
    avgRating?: number;

    // Map of course competencies and tags of their respective levels
    @IsNotEmpty()
    @IsObject()
    competency: CompetencyMap;
}

export class CourseInfoResponseDto { 

    readonly courseId: number;
    readonly bppUrl: string | null;
    readonly title: string;
    readonly description: string;
    readonly credits: number;
    readonly imageLink: string;
    readonly language: string[];
    readonly courseLink: string;
    readonly providerName: string;
    readonly author: string;
    readonly avgRating: number | null;
    readonly competency: JsonValue;
}

export class CourseSaveStatusDto {
    readonly saved: boolean
}