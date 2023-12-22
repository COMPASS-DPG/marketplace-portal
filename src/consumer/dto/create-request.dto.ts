import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum RequestStatus {
  Pending = "PENDING",
  InProgress = "IN_PROGRESS",
  Approved = "APPROVED",
  Rejected = "REJECTED"
}
export enum RequestType {
  Credit = "CREDIT",
  InvoiceRequest = "INVOICE_REQUEST",
  Settlement = "SETTLEMENT"
}

// RequestDto is used for creating a new request.
export class RequestDto {

  // Title of the request.
  @IsNotEmpty()
  @IsString()
  title: string;

  // Description of the request.
  @IsNotEmpty()
  @IsString()
  description: string;

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


// CreateRequestDto contains the fields required to forward the request to Request Service 
// which need not be passed in RequestDto
export class CreateRequestDto extends RequestDto {
  
  // User ID associated with the request.
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  // Status of the request
  @IsNotEmpty()
  @IsEnum(RequestStatus)
  status: RequestStatus;

  // Type of the request
  @IsNotEmpty()
  @IsEnum(RequestType)
  type: RequestType;
}

