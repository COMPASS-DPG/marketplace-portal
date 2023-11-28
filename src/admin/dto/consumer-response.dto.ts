// Might Need to change based on what data to show on Admin UI for every consumer
export class ConsumerDtoResponse {
  readonly consumerId: string;
  readonly savedCourses: number[];
}

export class AdminConsumerDtoResponse {
  readonly consumerId: string;
  readonly name?: string;
  readonly role?: string;
  readonly numCoursesPurchased: number;
  readonly credits: number;
}
