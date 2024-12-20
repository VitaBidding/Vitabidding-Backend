// src/point/controllers/point.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { PointService } from '../services';
import { AuthService } from '../../auth/services';
import { CreatePointRequestDto, UpdatePointRequestStatusDto } from '../dto';
import { Token } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';

@Controller('point')
export class PointController {
  constructor(
    private readonly pointService: PointService,
    private readonly authService: AuthService,
  ) {}

  @Get('user-info')
  @UseGuards(JwtAuthGuard)
  async getUserDefaultInfo(@Req() req) {
    return this.pointService.getUserDefaultInfo(req.user);
  }

  @Post('request')
  @UseGuards(JwtAuthGuard)
  async createPointRequest(@Req() req, @Body() dto: CreatePointRequestDto) {
    return this.pointService.createPointRequest(req.user, dto);
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getUserPointBalance(@Req() req, @Token() accessToken: string) {
    const userId = await this.authService.getUserIdFromToken(accessToken);

    return this.pointService.getUserPointBalance(userId);
  }

  /**
   * 충전 요청 상태 업데이트 (승인/거절)
   * @param requestId 요청 ID
   * @param dto 상태 업데이트 DTO
   */
  @Post('approve/:requestId')
  async updatePointRequestStatus(
    @Param('requestId') requestId: string,
    @Body() dto: UpdatePointRequestStatusDto,
  ) {
    return this.pointService.updatePointRequestStatus(requestId, dto);
  }

  /**
   * 충전 요청 조회 (Admin 전용)
   * @param status 상태별 필터링
   * @param userId 특정 사용자 필터링
   */
  @Get('requests')
  async getPointRequests(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.pointService.getPointRequests({ status, userId });
  }
}
