
export class ConsumerAccountDto {

    readonly consumerId: string;
    readonly emailId: string;
    readonly phoneNumber: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly credits: number;
    readonly numberOfPurchasedCourses: number;
}


export class CreditsDto {

    readonly credits: number;
}