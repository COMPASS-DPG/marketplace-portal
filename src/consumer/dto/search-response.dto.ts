import { CourseResponse } from "./course-response.dto";


export class SearchResponseDto {
    // list of courses fetched from course manager
    readonly courses: CourseResponse[];

    // beckn search response message id
    readonly messageId: string;
}