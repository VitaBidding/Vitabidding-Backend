// src/main.ts
import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from './app.module';
import { corsOption, getNestOptions } from './app.options';
import { setSwagger } from './app.swagger';
import { BusinessExceptionFilter } from './exception';

async function bootstrap() {
  initializeTransactionalContext();

  // SSL 키와 인증서 경로
  const keyPath = path.join(__dirname, '..', 'key.pem');
  const certPath = path.join(__dirname, '..', 'cert.pem');

  // HTTPS 옵션 세팅 (파일이 존재할 때만)
  let httpsOptions = undefined;
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  // Nest 애플리케이션 생성 시 httpsOptions를 전달
  const app = await NestFactory.create(AppModule, {
    ...getNestOptions(),
    httpsOptions,
  });

  // 글로벌 예외 필터
  app.useGlobalFilters(new BusinessExceptionFilter());

  // 글로벌 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const firstErrorMessage = errors[0]?.constraints
          ? Object.values(errors[0].constraints)[0]
          : '유효성 검사 실패';
        return new BadRequestException(firstErrorMessage);
      },
    }),
  );

  // ConfigService로 환경변수 불러오기
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');
  const env = configService.get<string>('SERVER_RUNTIME');
  const serviceName = configService.get<string>('SERVER_SERVICE_NAME');

  // Swagger 설정
  setSwagger(app);

  // CORS 설정
  app.enableCors(corsOption(env));

  // ---- 여기서가 핵심: Nest 자체가 HTTPS 또는 HTTP 서버를 구동 ----
  await app.listen(port);

  // 실행 로그
  if (httpsOptions) {
    console.log(
      `✅ HTTPS 서버 실행 중\n✅ 런타임: ${env}\n✅ 포트: ${port}\n✅ 서비스명: ${serviceName}`,
    );
  } else {
    console.log(
      `✅ HTTP 서버 실행 중\n✅ 런타임: ${env}\n✅ 포트: ${port}\n✅ 서비스명: ${serviceName}`,
    );
  }
}

bootstrap();
