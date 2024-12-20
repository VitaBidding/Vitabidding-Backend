// src/point/entities/point-transaction.entity.ts
import { Entity, Column, ManyToOne, Relation, Index } from 'typeorm';
import { BaseEntity } from '../../common/entity';
import { Point } from './point.entity';

@Entity()
@Index('point_transaction_pointid_index', ['point'])
@Index('point_transaction_type_index', ['transactionType'])
export class PointTransaction extends BaseEntity {
  @ManyToOne(() => Point, (point) => point.transactions, {
    onDelete: 'CASCADE',
  })
  point: Relation<Point>;

  @Column({
    type: 'enum',
    enum: ['charge', 'use', 'refund'],
    comment: '??? ?? ??',
  })
  transactionType: 'charge' | 'use' | 'refund';

  @Column({ type: 'int', comment: '??? ??? ?? (?? ?? ??)' })
  amount: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '?? ??',
  })
  transactionAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '?? ?? ?? ??? ??',
  })
  reason: string | null;
}
