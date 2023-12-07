import { JsonValue } from "@prisma/client/runtime/library";

export class CourseResponse {

    readonly id: number;
    readonly providerId: string;
    readonly title: string;
    readonly description: string;
    readonly courseLink: string;
    readonly imgLink: string;
    readonly credits: number;
    readonly language: string[];
    readonly duration: number;
    readonly competency: JsonValue;
    readonly author: string;
    readonly avgRating: number | null;
    readonly status: CourseStatus;
    readonly startDate: Date | null;
    readonly endDate: Date | null;
    readonly bppId: string | null;
    readonly bppUri: string | null;
}

export type CourseStatus = "ARCHIVED" | "UNARCHIVED";

export type CourseVerificationStatus = "PENDING" | "APPROVED" | "REJECTED";


export class SaveStatusResDto {
    readonly saved: boolean
}