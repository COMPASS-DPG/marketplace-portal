import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CourseIdDto {
    // course ID as in the BPP
    @IsNotEmpty()
    @IsString()
    courseId: string;

    // course BPP id
    @IsOptional()
    @IsString()
    bppId?: string;
}