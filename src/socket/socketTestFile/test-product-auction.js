// test-product-auction.js
// 실행: 해당 파일이 있는 경로로 터미널 이동 후 node test-product-auction.js

const { io } = require('socket.io-client');

// 1) 실제 서버 주소 / 네임스페이스
const SOCKET_URL = 'https://localhost:4000/product';

// 2) Query 파라미터 또는 header로 보낼 토큰
// 실제 서비스 환경에서는 유효한 JWT를 넣어야 됨
const FAKE_JWT_TOKEN = 'eyJhbGciOiJF...'; // 예) 실제 유효한 토큰

// 3) 연결 옵션
const socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket'],
  rejectUnauthorized: false, // 개발용 SSL 인증서 무시
  // query 파라미터로 토큰 전송
  // query: { token: FAKE_JWT_TOKEN },
  // 만약 header로 넘기고 싶다면 아래처럼 가능:
  extraHeaders: { authorization: FAKE_JWT_TOKEN },
});

socket.on('connect', () => {
  console.log('[Client] Connected:', socket.id);

  // 4) "enterProduct" 이벤트를 보내 Room에 join
  socket.emit('enterProduct', { productId: '1234' });

  // 잠시 뒤에 "placeBid" 이벤트로 입찰해보기 (3초 후)
  setTimeout(() => {
    console.log('[Client] Trying placeBid...');
    socket.emit('placeBid', { productId: '1234', bidAmount: 5000 });
  }, 3000);
});

socket.on('notice', (data) => {
  console.log('[Client] Notice:', data);
});

socket.on('bidUpdated', (data) => {
  console.log('[Client] Bid Updated:', data);
});

socket.on('connect_error', (err) => {
  console.error('[Client] Connection Error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log('[Client] Disconnected:', reason);
});

// 테스트 시나리오
// 1. 연결 성공 시 handleConnection(client) → console.log('Client connected...')
// 2. enterProduct 이벤트 emit → 서버의 handleEnterProduct() 실행
//  - 서버에서 client.join('product_1234') → 콘솔에 [enterProduct] user=... joined product_1234 로그
//  - this.server.to('product_1234').emit('notice', {...}) → 클라이언트에서 notice 이벤트 수신
// 3. placeBid 이벤트 emit → 서버의 handlePlaceBid()에서 로그, bidUpdated 브로드캐스트

// 실시간 경매 제어 (판매자용 컨트롤러) 기능은 아직 추가되어 있지 않음
