// src/point/repositories/point-request.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PointRequest } from '../entities';

@Injectable()
export class PointRequestRepository extends Repository<PointRequest> {
  constructor(
    @InjectRepository(PointRequest)
    private readonly repo: Repository<PointRequest>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createRequest(data: Partial<PointRequest>): Promise<PointRequest> {
    const request = this.repo.create(data);
    return this.repo.save(request);
  }

  async findRequestById(id: string): Promise<PointRequest | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['point', 'point.user'], // `point`와 `point.user` 관계를 명시적으로 로드
    });
  }
}
