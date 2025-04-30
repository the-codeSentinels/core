import { app, BrowserWindow, globalShortcut } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { platform } from 'node:os';

import '../relay.js';                  // boot the WS relay
import { broadcast } from '../relay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// ────────────────────────────────────────────────
//  Spawn the overlay / recorder scanner (Windows)
// ────────────────────────────────────────────────
if (platform() === 'win32') {
  const scannerExe = join(
    __dirname,
    '../../overlay-scanner/publish/OverlayScanner.exe'
  );

  const scanner = spawn(scannerExe, [], { windowsHide: true });

  scanner.stdout.on('data', data => {
    const line = data.toString().trim();
    console.log('[scanner]', line);

    // Decide what kind of event it is
    let type = 'overlay';
    if (line.includes('Screen recorder detected')) type = 'recorder';

    broadcast({ ts: Date.now(), type, line });
  });

  scanner.stderr.on('data', d =>
    console.error('[scanner-err]', d.toString().trim())
  );

  app.on('will-quit', () => scanner.kill());
}

// ────────────────────────────────────────────────
//  Electron kiosk window
// ────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: { contextIsolation: true }
  });

  win.loadURL(DEV_URL);

  // quick-quit shortcut
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());
}

app.on('window-all-closed', () => {});
app.whenReady().then(createWindow);
