import { ApiProperty } from "@nestjs/swagger";
import { NotificationStatus } from "@prisma/client";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateNotificationDto {

    //  Notification Text
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    text: string;

    //  Feedback Text
    @ApiProperty()
    @IsNotEmpty()
    @IsUrl()
    link: string;
}


export class NotificationResponseDto extends CreateNotificationDto {

    readonly id: number;
    readonly consumerId: string;
    readonly status: NotificationStatus;
}
