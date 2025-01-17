// chat.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  formatMessage(clientId: string, message: string): string {
    // 실제로는 DB 연동, 메시지 가공 등 원하는 로직을 수행 가능
    return `[${clientId}] ${message}`;
  }
}
