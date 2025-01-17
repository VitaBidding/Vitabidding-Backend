// chat.gateway.ts
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  // 포트나 경로가 다르면 여기서 설정할 수 있습니다.
  namespace: '/chat',
  cors: {
    origin: '*', // 실제 운영 시에는 도메인을 명시하거나 설정을 강화해야 합니다.
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  /**
   * 클라이언트가 소켓 연결을 맺었을 때 실행
   */
  handleConnection(client: Socket): void {
    // console.log(`Client connected: ${client.id}`);
    console.log(`Client connected: ${client.id}, nsp=${client.nsp.name}`);
    // 필요하다면 채팅방 참여, 유저 정보를 가져오는 로직 등을 추가
  }

  /**
   * 클라이언트가 소켓 연결을 끊었을 때 실행
   */
  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    // 필요하다면 채팅방 퇴장 등 처리 로직 추가
  }

  /**
   * 특정 이벤트를 구독하고 메시지를 전송받았을 때 로직 처리
   */
  @SubscribeMessage('msgToServer')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log('--- handleMessage called! ---');
    console.log('message =', message);
    // 비즈니스 로직은 ChatService로 위임
    const formattedMessage = this.chatService.formatMessage(client.id, message);

    // 서버 전체 클라이언트에게 메시지 전송
    this.server.emit('msgToClient', formattedMessage);
  }
}
