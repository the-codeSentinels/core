// secure-browser/relay.js
import { WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';

const PORT = 9000;

let isRelayUp = false;
let wss = new WebSocketServer({ port: PORT });

// Once we’re actually listening, flip the flag and log success
wss.on('listening', () => {
  console.log(`🔌  Telemetry relay up on ws://localhost:${PORT}`);
  isRelayUp = true;
});

// If the port is already bound, emit a warning and don’t crash
wss.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️  Relay port ${PORT} already in use, skipping server start`);
    // clean up the half-open server
    wss.close();
  } else {
    // some other error: rethrow
    throw err;
  }
});

// Only when the server is truly up do we attach connection/close handlers
wss.on('connection', ws => {
  const id = uuid().slice(0, 8);
  console.log(`▶️  interviewer connected (${id})`);
  ws.on('close',   () => console.log(`⏹️  interviewer left (${id})`));
});

/** Broadcast helper — no-ops if the server never came up */
export function broadcast(msg) {
  if (!isRelayUp) return;
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}
