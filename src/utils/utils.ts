import { HttpStatus } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const validationOptions = {
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};


export function getPrismaErrorStatusAndMessage(error: any): {
  errorMessage: string | undefined;
  statusCode: number;
} {
  if(error instanceof PrismaClientKnownRequestError) {
    const errorCode = error?.code || "DEFAULT_ERROR_CODE";
    const errorCodeMap: Record<string, number> = {
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2003: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
    };

    const statusCode = errorCodeMap[errorCode] || HttpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message.split('\n').pop();
    return { statusCode, errorMessage };
  }

  const statusCode = 
    error?.status || error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
  
  return {
    statusCode, 
    errorMessage: error.message,
  };
}