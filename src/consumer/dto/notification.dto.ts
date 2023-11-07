import { NotificationStatus } from "@prisma/client";

export class NotificationDto {

    readonly id: number;
    readonly consumerId: string;
    readonly text: string;
    readonly link: string;
    readonly status: NotificationStatus;
}
