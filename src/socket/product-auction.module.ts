// src/socket/product-auction.module.ts
import { Module } from '@nestjs/common';
import { ProductAuctionGateway } from './product-auction.gateway';
import { WsAuthGuard } from '../common/guards/ws-auth.guard';
import { AuthModule } from '../auth/auth.module'; // <-- AuthService를 제공해주는 모듈

@Module({
  imports: [AuthModule],
  providers: [ProductAuctionGateway, WsAuthGuard],
})
export class ProductAuctionModule {}
