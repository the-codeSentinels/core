// secure-browser/electron/main.js
import { app, BrowserWindow, globalShortcut, Menu, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { platform } from 'node:os';

import { startRelay, broadcast } from '../relay.js';   // will noop if already running
startRelay();                                          // safe – binds only if free

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

/* ── BrowserWindow factory ─────────────────────────────── */
function createWindow() {
  if (process.platform === 'darwin') app.dock.hide();
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    kiosk: true,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')   // exposes quit IPC
    }
  });

  /* block context menu & shortcuts */
  win.webContents.on('context-menu', e => e.preventDefault());
  win.webContents.on('before-input-event', (e, input) => {
    if (input.control || input.meta || input.alt) e.preventDefault();
  });

  /* blur event → immediately refocus & notify interviewer */
  win.on('blur', () => {
    broadcast({ ts: Date.now(), type: 'blur', line: 'window lost focus' });
    win.focus();
  });

  /* load content */
  if (DEV_SERVER_URL) win.loadURL(DEV_SERVER_URL);
  else                win.loadFile(join(__dirname, '../dist/index.html'));

  /* controlled quit hot-key */
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());
}

/* ── scanner (Windows only) ────────────────────────────── */
if (platform() === 'win32') {
  const exe = join(__dirname, '../../overlay-scanner/publish/OverlayScanner.exe');
  const scanner = spawn(exe, [], { windowsHide: true });

  scanner.stdout.on('data', d => {
    const line = d.toString().trim();
    const type = line.includes('Screen recorder') ? 'recorder' : 'overlay';
    broadcast({ ts: Date.now(), type, line });
  });

  scanner.stderr.on('data', d => console.error('[scanner-err]', d.toString().trim()));
  app.on('will-quit', () => scanner.kill());
}

/* ── IPC: renderer requests quit after timer ───────────── */
ipcMain.on('quitAfterTimer', () => app.quit());

/* ── app lifecycle ─────────────────────────────────────── */
app.on('window-all-closed', () => {});
app.whenReady().then(createWindow);
if (process.platform === 'darwin')
  app.on('activate', () => BrowserWindow.getAllWindows().length || createWindow());
