import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

// export enum RequestStatus {
//     PENDING,
//     IN_PROGRESS,
//     APPROVED,
//     REJECTED
// }
export type RequestStatus = "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";

// export enum RequestType {
//     CREDIT,
//     INVOICE_REQUEST,
//     SETTLEMENT
// }

export type RequestType = "CREDIT" | "INVOICE_REQUEST" | "SETTLEMENT";

// CreateRequestDto is used for creating a new request.
export class CreateRequestDto {
  // User ID associated with the request.
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  // Title of the request.
  @IsNotEmpty()
  @IsString()
  title: string;

  // Status of the request
  @IsNotEmpty()
  status: RequestStatus;

  // Description of the request.
  @IsNotEmpty()
  @IsString()
  description: string;

  // Type of the request
  @IsNotEmpty()
  type: RequestType;

  // Optional content of the request in JSON format.
  @IsOptional()
  // Use the @Transform decorator to apply a custom transformation to a property.
  @Transform(({ value }: TransformFnParams) => {
    try {
      // Try to parse the input value as JSON to convert it into a JavaScript object.
      return JSON.parse(value);
    } catch (error) {
      // If parsing fails (e.g., if value is not a valid JSON string), return the original value.
      return value;
    }
  })
  requestContent?: object;

  // Optional content of the response in JSON format.
  @IsOptional()
  // Use the @Transform decorator to apply a custom transformation to a property.
  @Transform(({ value }: TransformFnParams) => {
    try {
      // Try to parse the input value as JSON to convert it into a JavaScript object.
      return JSON.parse(value);
    } catch (error) {
      // If parsing fails (e.g., if value is not a valid JSON string), return the original value.
      return value;
    }
  })
  responseContent?: object;

  // Optional remark or additional information about the request.
  @IsOptional()
  @IsString()
  remark?: string;

  // Optional creation date of the request.
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  // Optional update date of the request.
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

