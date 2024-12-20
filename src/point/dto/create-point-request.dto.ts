// src/point/dto/create-point-request.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreatePointRequestDto {
  @IsInt()
  @Min(1)
  requestedPoints: number;

  @IsOptional()
  @IsString()
  depositorName?: string;

  @IsOptional()
  @IsPhoneNumber('KR') // 한국 전화번호 형식
  phoneNumber?: string;
}
