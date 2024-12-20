// src/point/repositories/point.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from '../entities';

@Injectable()
export class PointRepository extends Repository<Point> {
  constructor(
    @InjectRepository(Point)
    private readonly repo: Repository<Point>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    const point = await this.repo.findOne({ where: { user: { id: userId } } });
    if (point) {
      point.totalPoints += points;
      point.totalChargedPoints += points;
      await this.repo.save(point);
    }
  }
}
