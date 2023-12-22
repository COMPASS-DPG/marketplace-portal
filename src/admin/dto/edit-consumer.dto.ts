import { PartialType } from "@nestjs/swagger";
import { ConsumerDtoResponse } from "./consumer-response.dto";

export class EditConsumerDto extends PartialType(ConsumerDtoResponse) {
    
}