import { JsonValue } from "@prisma/client/runtime/library";
import { IsNotEmpty, IsString, Min, IsInt, IsArray, IsUrl, ArrayNotEmpty, IsNumber, IsOptional, IsObject } from "class-validator";
import { CompetencyMap } from "src/utils/types";

export class CourseInfoDto {

    // course ID as in the BPP
    @IsNotEmpty()
    @IsString()
    courseId: string;

    // course BPP id
    @IsOptional()
    @IsString()
    bppId?: string;
    
    // course BPP URI
    @IsOptional()
    @IsString()
    bppUri?: string;
    
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

    // provider ID
    @IsNotEmpty()
    @IsString()
    providerId: string;

}

export class CourseInfoResponseDto { 

    readonly courseId: string;
    readonly bppId: string | null;
    readonly bppUri: string | null;
    readonly title: string;
    readonly description: string;
    readonly credits: number;
    readonly imageLink: string;
    readonly language: string[];
    readonly providerName: string;
    readonly author: string;
    readonly avgRating: number | null;
    readonly competency: JsonValue;
    readonly providerId: string;
    readonly numberOfPurchases?: number;
}

export class PurchasedCourseInfoResponseDto extends CourseInfoResponseDto { 
    readonly courseLink: string | null;
}