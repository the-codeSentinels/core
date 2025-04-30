import { WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';

const PORT = 9000;
const wss  = new WebSocketServer({ port: PORT });
console.log(`🔌  Telemetry relay up on ws://localhost:${PORT}`);

wss.on('connection', ws => {
  const id = uuid().slice(0, 8);
  console.log(`▶️  interviewer connected (${id})`);
  ws.on('close',   () => console.log(`⏹️  interviewer left (${id})`));
});

/** broadcast helper */
export function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(ws => ws.readyState === 1 && ws.send(data));
}
