// src/point/entities/point.entity.ts
import { Entity, Column, OneToMany, Relation, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../common/entity';
import { User } from '../../auth/entities/user.entity';
import { PointTransaction } from './point-transaction.entity';

@Entity()
@Index('point_userid_index', ['user'])
export class Point extends BaseEntity {
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @OneToMany(() => PointTransaction, (transaction) => transaction.point)
  transactions: Relation<PointTransaction[]>;

  @Column({ type: 'int', default: 0, comment: '사용자가 보유한 총 포인트' })
  totalPoints: number;

  @Column({ type: 'int', default: 0, comment: '사용자에게 지급된 총 포인트' })
  totalChargedPoints: number;

  @Column({ type: 'int', default: 0, comment: '사용자가 사용한 총 포인트' })
  totalUsedPoints: number;

  @Column({ type: 'int', default: 0, comment: '사용자가 환불받은 총 포인트' })
  totalRefundedPoints: number;
}
