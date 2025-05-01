// secure-browser/relay.js
import http from 'node:http';
import net  from 'node:net';
import { WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';

const WS_PORT = 9000;
const HB_PORT = 9001;

let wss;                // WebSocket server reference

/* ── util: test if a TCP port is free ───────────────────── */
function isPortFree(port) {
  return new Promise(res => {
    const tester = net
      .createServer()
      .once('error', () => res(false))
      .once('listening', () => tester.close(() => res(true)))
      .listen(port, '127.0.0.1');
  });
}

/* ── broadcast helper (safe if wss undefined) ───────────── */
export function broadcast(msg) {
  if (!wss) return;
  const data = JSON.stringify(msg);
  wss.clients.forEach(ws => ws.readyState === ws.OPEN && ws.send(data));
}

/* ── startRelay: only binds if ports are free ───────────── */
export async function startRelay() {
  const wsFree = await isPortFree(WS_PORT);
  const hbFree = await isPortFree(HB_PORT);

  if (!wsFree && !hbFree) {
    console.log('🟡 relay already running');
    return;
  }
  if (!wsFree || !hbFree) {
    console.error('⚠️  partial port collision; aborting relay start');
    return;
  }

  /* WebSocket relay */
  wss = new WebSocketServer({ port: WS_PORT });
  console.log(`🔌 Telemetry relay up on ws://localhost:${WS_PORT}`);

  wss.on('connection', ws => {
    const id = uuid().slice(0, 8);
    console.log(`▶️  interviewer connected (${id})`);
    ws.on('close', () => console.log(`⏹️  interviewer left (${id})`));
  });

  /* HTTP heartbeat */
  http
    .createServer((_, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ last: Date.now() }));
    })
    .listen(HB_PORT, () =>
      console.log(`🔌 Heartbeat endpoint on http://localhost:${HB_PORT}/heartbeat`)
    );
}

/* auto-start when imported */
startRelay();
