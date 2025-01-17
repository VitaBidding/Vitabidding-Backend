// src/socket/product-auction.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from '../common/guards/ws-auth.guard';
import { SocketWithUser } from '../types/socket-with-user';
// import { ProductService } from '../business/services/product.service'; // 필요하면 import

@WebSocketGateway({
  namespace: '/product',
  cors: { origin: '*' },
})
export class ProductAuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // 필요하다면 서비스 주입
  // constructor(private readonly productService: ProductService) {}

  /**
   * 소켓 연결(Handshake) 시점: Guard로 인증
   */
  @UseGuards(WsAuthGuard)
  handleConnection(client: SocketWithUser) {
    console.log(`Client connected: ${client.id}, userId=${client.userId}`);
    // 여기서 client.userId는 WsAuthGuard에서 세팅
  }

  handleDisconnect(client: SocketWithUser) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * 특정 상품 페이지(판매자 아이템)에 들어오면 Room에 join
   */
  @SubscribeMessage('enterProduct')
  @UseGuards(WsAuthGuard)
  handleEnterProduct(
    @MessageBody() data: { productId: string },
    @ConnectedSocket() client: SocketWithUser,
  ) {
    const userId = client.userId; // WsAuthGuard에서 세팅된 값
    const { productId } = data;

    // (선택) DB에서 productId 검증
    // const product = this.productService.getProductById(productId);
    // if (!product) {
    //   client.emit('errorMsg', '상품이 존재하지 않습니다.');
    //   return;
    // }

    // 소켓.IO Room join → "product_상품ID"
    const roomName = `product_${productId}`;
    client.join(roomName);
    console.log(`[enterProduct] user=${userId} joined ${roomName}`);

    // 다른 사람에게 참여 알림
    this.server.to(roomName).emit('notice', {
      message: `User(${userId}) joined product(${productId})`,
    });
  }

  /**
   * 입찰(bid) 이벤트 예시
   */
  @SubscribeMessage('placeBid')
  @UseGuards(WsAuthGuard)
  handlePlaceBid(
    @MessageBody() data: { productId: string; bidAmount: number },
    @ConnectedSocket() client: SocketWithUser,
  ) {
    const userId = client.userId;
    const { productId, bidAmount } = data;

    console.log(
      `User(${userId}) placed a bid of ${bidAmount} on product(${productId})`,
    );

    // (선택) 경매 로직 처리: DB 저장, 최고가 갱신 등...
    // this.productService.placeBid(productId, userId, bidAmount);

    // 모든 참가자에게 알림
    const roomName = `product_${productId}`;
    this.server.to(roomName).emit('bidUpdated', {
      userId,
      productId,
      bidAmount,
    });
  }
}
