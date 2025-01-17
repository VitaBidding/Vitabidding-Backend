// src/common/guards/ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient(); // Socket 객체
    // 토큰을 query 또는 headers에서 꺼내 옴
    const token =
      client.handshake?.query?.token ||
      client.handshake?.headers?.authorization;

    if (!token) {
      return false;
    }

    try {
      // AuthService의 토큰 검증 메서드 활용 (실제 로직)
      // const userId = await this.authService.getUserIdFromToken(token);
      // if (!userId) {
      //   return false;
      // }

      // 소켓 객체에 userId를 저장해두면 이후 handleMessage 등에서 사용 가능
      const userId = 'testUser123'; // 테스트용 로직 (실제 테스트 시 주석처리)
      client.userId = userId;
      return true;
    } catch (error) {
      return false;
    }
  }
}
