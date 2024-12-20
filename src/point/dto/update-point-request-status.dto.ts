// src/point/dto/update-point-request-status.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdatePointRequestStatusDto {
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  adminComment?: string;
}
