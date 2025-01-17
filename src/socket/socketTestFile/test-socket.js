// test-socket.js
const io = require('socket.io-client');

const socket = io('https://localhost:4000/chat', {
  path: '/socket.io',
  transports: ['websocket'],
  rejectUnauthorized: false, // 개발용 SSL 인증서 무시
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  // 여기서 바로 이벤트 전송
  socket.emit('msgToServer', 'Hello from Node client!');
});

socket.on('msgToClient', (data) => {
  console.log('Received msgToClient:', data);
});

socket.on('connect_error', (err) => {
  console.log('Connection Error:', err.message);
});
