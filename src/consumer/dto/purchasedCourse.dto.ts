import { CourseProgressStatus } from "@prisma/client";
import { CourseInfoDto } from "./courseInfo.dto";

export class PurchasedCourseDto {

    readonly id: number;
    readonly consumerId: string;
    readonly courseId: number;
    readonly status: CourseProgressStatus;
    readonly walletTransactionId: number;
    readonly becknTransactionId: number;
    readonly rating: number | null;
    readonly feedback: string | null;
    readonly course: CourseInfoDto;
}