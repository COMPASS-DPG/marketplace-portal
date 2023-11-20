
export class ConsumerAccountDto {

    readonly consumerId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly credits: number;
    readonly numberOfPurchasedCourses: number;
}


export class CreditsDto {

    readonly credits: number;
}