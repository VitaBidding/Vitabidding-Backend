// src/types/socket-with-user.ts

// 1. Socket.IO 타입 임포트
import { Socket } from 'socket.io';

// 2. 커스텀 인터페이스 생성
export interface SocketWithUser extends Socket {
  userId?: string; // or userId: string;
}
