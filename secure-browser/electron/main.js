import { app, BrowserWindow, globalShortcut } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import '../relay.js';            // starts the relay server
import { broadcast } from '../relay.js';

import { spawn } from 'node:child_process';
import { platform } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// Only spawn the Windows scanner on Win32
if (platform() === 'win32') {
  const scannerExe = join(__dirname, '../../overlay-scanner/publish/OverlayScanner.exe');
  const scanner = spawn(scannerExe, [], { windowsHide: true });

  scanner.stdout.on('data', data => {
    const line = data.toString().trim();
    console.log('[scanner]', line);
    broadcast({ ts: Date.now(), type: 'overlay', line });
  });

  scanner.stderr.on('data', data => {
    console.error('[scanner-err]', data.toString().trim());
  });

  app.on('will-quit', () => scanner.kill());
}

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: { contextIsolation: true }
  });

  win.loadURL(DEV_URL);

  // quit with Cmd/Ctrl-Shift-Q
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());
}

app.on('window-all-closed', () => {});
app.whenReady().then(createWindow);
