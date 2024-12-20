// src/point/entities/point-request.entity.ts
import { Entity, Column, ManyToOne, Relation, Index } from 'typeorm';
import { BaseEntity } from '../../common/entity';
import { Point } from './point.entity';

@Entity()
@Index('point_request_pointid_index', ['point'])
@Index('point_request_status_index', ['status'])
export class PointRequest extends BaseEntity {
  @ManyToOne(() => Point, { onDelete: 'CASCADE' })
  point: Relation<Point>;

  @Column({ type: 'int', comment: '충전 요청 포인트 수량' })
  requestedPoints: number;

  @Column({ type: 'varchar', length: 255, comment: '입금자 이름' })
  depositorName: string;

  @Column({ type: 'varchar', length: 50, comment: '문자를 받을 전화번호' })
  phoneNumber: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '충전 요청 시간',
  })
  requestedAt: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    comment: '충전 상태',
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'timestamp', nullable: true, comment: '승인 시간' })
  approvedAt: Date | null;

  @Column({ type: 'varchar', nullable: true, comment: '관리자 승인자 이름' })
  approvedBy: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: '관리자 코멘트 (거절 사유 등)',
  })
  adminComment: string | null;
}
