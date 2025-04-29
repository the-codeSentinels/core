import { app, BrowserWindow, globalShortcut } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

import { spawn } from 'node:child_process';
import { platform } from 'node:os';

// Launch scanner only on Windows where .exe exists
let scanner;
if (platform() === 'win32') {
  const scannerExe = join(__dirname, '../../overlay-scanner/publish/OverlayScanner.exe');
  scanner = spawn(scannerExe, [], { windowsHide: true });
  scanner.stdout.on('data', d => console.log('[scanner]', d.toString().trim()));
  scanner.stderr.on('data', d => console.error('[scanner-err]', d.toString().trim()));
  app.on('will-quit', () => scanner.kill());
}

const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

function createWindow () {
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