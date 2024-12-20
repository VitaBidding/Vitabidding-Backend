// src/point/point.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointRepository, PointRequestRepository } from './repositories';
import { Point, PointRequest, PointTransaction } from './entities';
import { PointService } from './services';
import { PointController } from './controllers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Point, PointRequest, PointTransaction]),
    forwardRef(() => AuthModule),
  ],
  providers: [PointRequestRepository, PointRepository, PointService],
  controllers: [PointController],
  exports: [PointRepository],
})
export class PointModule {}
