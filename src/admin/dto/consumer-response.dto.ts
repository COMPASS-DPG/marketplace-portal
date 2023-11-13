// Might Need to change based on what data to show on Admin UI for every consumer
export class ConsumerDtoResponse {
    consumerId: string;
    walletId: number;
    coursesPurchased: number[];
    savedCourses: number[];
}