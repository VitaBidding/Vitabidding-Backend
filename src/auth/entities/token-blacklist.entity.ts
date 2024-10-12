// src/auth/entities/token-blacklist.entity.ts
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entity';

@Entity()
export class TokenBlacklist extends BaseEntity {
  @Column()
  token: string;

  @Column()
  jti: string;

  @Column({ type: 'enum', enum: ['access', 'refresh'] })
  tokenType: 'access' | 'refresh';

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
