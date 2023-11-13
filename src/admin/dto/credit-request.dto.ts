import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreditRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  consumerId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  credits: number;
}