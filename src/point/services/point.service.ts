// src/point/services/point.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PointRepository, PointRequestRepository } from '../repositories';
import { User } from '../../auth/entities';
import { Point } from '../entities';
import { CreatePointRequestDto, UpdatePointRequestStatusDto } from '../dto';
import axios from 'axios';
import { SmsStrategy } from '../../auth/strategies';

@Injectable()
export class PointService {
  constructor(
    private readonly configService: ConfigService,
    private readonly pointRequestRepository: PointRequestRepository,
    private readonly pointRepository: PointRepository,
    private readonly smsStrategy: SmsStrategy,
  ) {}

  async getUserDefaultInfo(user: User) {
    return {
      realName: user.realName,
      phone: user.phone,
    };
  }

  async createPointRequest(user: User, dto: CreatePointRequestDto) {
    const depositorName = dto.depositorName || user.realName;
    const phoneNumber = dto.phoneNumber || user.phone;
    const formattedAmount = new Intl.NumberFormat('ko-KR').format(
      dto.requestedPoints,
    ); // 숫자 포맷

    // 관련된 Point 엔티티 초기화 및 조회
    const point = await this.initializeUserPoint(user);

    if (dto.requestedPoints <= 0) {
      throw new Error('Requested points must be greater than zero.');
    }

    const pointRequest = await this.pointRequestRepository.createRequest({
      point,
      requestedPoints: dto.requestedPoints,
      depositorName,
      phoneNumber,
    });

    // 디스코드 Webhook 메시지 전송
    try {
      await axios.post(this.configService.get<string>('DISCORD_WEBHOOK'), {
        embeds: [
          {
            title: '포인트 충전 요청',
            description: '새로운 포인트 충전 요청이 접수되었습니다.',
            color: 3066993,
            fields: [
              { name: '사용자', value: user.name, inline: true },
              {
                name: '요청 포인트',
                value: `${formattedAmount} 포인트`,
                inline: true,
              },
              { name: '입금자명', value: depositorName, inline: true },
              { name: '휴대전화', value: phoneNumber, inline: true },
            ],
            thumbnail: {
              url: this.configService.get<string>('DISCORD_WEBHOOK_THUMBNAIL'),
            },
            footer: {
              text: `요청 시간: ${new Date().toLocaleString()}`,
            },
          },
        ],
      });
    } catch (error) {
      console.error('Failed to send Discord webhook:', error.message);
    }

    // 입금 계좌 정보 문자 전송
    try {
      const depositAccount = this.configService.get<string>('PAYMENT_NUMBER');
      const message = `${depositAccount}
${this.configService.get<string>('PAYMENT_NAME')}
${formattedAmount}원`;
      await this.smsStrategy.sendCustomMessage(phoneNumber, message);
    } catch (error) {
      console.error('Failed to send SMS:', error.message);
    }

    return pointRequest;
  }

  async initializeUserPoint(user: User): Promise<Point> {
    let point = await this.pointRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!point) {
      point = this.pointRepository.create({
        user,
        totalPoints: 0,
        totalChargedPoints: 0,
        totalUsedPoints: 0,
        totalRefundedPoints: 0,
      });

      await this.pointRepository.save(point);
    }

    return point;
  }

  async updatePointRequestStatus(
    requestId: string,
    dto: UpdatePointRequestStatusDto,
  ): Promise<void> {
    const { status, adminComment } = dto;

    const request =
      await this.pointRequestRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Point request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request already processed');
    }

    request.status = status;
    request.adminComment = status === 'rejected' ? adminComment : null;
    if (status === 'approved') {
      request.approvedAt = new Date();
    }

    await this.pointRequestRepository.save(request);

    if (status === 'approved') {
      await this.pointRepository.updateUserPoints(
        request.point.user.id,
        request.requestedPoints,
      );
    }
  }

  /**
   * 충전 요청 목록 조회
   * @param filters 상태(status) 및 사용자(userId) 필터
   */
  async getPointRequests(filters: { status?: string; userId?: string }) {
    const { status, userId } = filters;

    const query = this.pointRequestRepository
      .createQueryBuilder('pointRequest')
      .leftJoinAndSelect('pointRequest.point', 'point')
      .leftJoinAndSelect('point.user', 'user'); // User 테이블과 조인

    if (status) {
      query.andWhere('pointRequest.status = :status', { status });
    }

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    return query
      .select([
        'pointRequest.id',
        'pointRequest.requestedPoints',
        'pointRequest.depositorName',
        'pointRequest.phoneNumber',
        'pointRequest.status',
        'pointRequest.requestedAt',
        'point.id',
        'user.id',
        'user.realName',
        'user.phone',
      ])
      .getMany();
  }

  async getUserPointBalance(userId: string) {
    const point = await this.pointRepository
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.user', 'user')
      .where('user.id = :userId', { userId })
      .select([
        'point.id',
        'point.totalPoints',
        'point.totalChargedPoints',
        'point.totalUsedPoints',
        'point.totalRefundedPoints',
      ])
      .getOne();

    if (!point) {
      return {
        totalPoints: 0,
        totalChargedPoints: 0,
        totalUsedPoints: 0,
        totalRefundedPoints: 0,
      };
    }

    return {
      totalPoints: point.totalPoints,
      totalChargedPoints: point.totalChargedPoints,
      totalUsedPoints: point.totalUsedPoints,
      totalRefundedPoints: point.totalRefundedPoints,
    };
  }
}
