import { CourseProgressStatus } from "@prisma/client";
import { PurchasedCourseInfoResponseDto } from "./courseInfo.dto";

export class PurchasedCourseDto {

    readonly id: number;
    readonly consumerId: string;
    readonly courseInfoId: number;
    readonly status: CourseProgressStatus;
    readonly becknTransactionId: string | null;
    readonly becknMessageId: string | null;
    readonly rating: number | null;
    readonly feedback: string | null;
    readonly CourseInfo: PurchasedCourseInfoResponseDto;
    readonly purchasedAt: Date;
    readonly completedAt: Date | null;
}

export class PurchaseStatusDto {
    readonly purchased: boolean
    readonly courseLink: string | null
}