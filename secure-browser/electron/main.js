import { app, BrowserWindow, globalShortcut, Menu } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { platform } from 'node:os';

import '../relay.js';                  // starts the WS relay
import { broadcast } from '../relay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// If you're running dev:all, this env var will be set
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

/**
 * Create the candidate kiosk window
 */
function createWindow() {
  // Hide Dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  // Remove any application menu
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    kiosk: true,               // fullscreen + always-on-top + no OS chrome
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Block right-click context menu
  win.webContents.on('context-menu', e => e.preventDefault());

  // Block any modifier-based shortcuts (copy/paste, devtools, etc.)
  win.webContents.on('before-input-event', (e, input) => {
    if (input.control || input.meta || input.alt) {
      e.preventDefault();
    }
  });

  // Any time the window blurs, force it back and tell the interviewer
  win.on('blur', () => {
    const ts = Date.now();
    console.log('[blur] window lost focus');
    broadcast({ ts, type: 'blur', line: 'window lost focus' });
    // immediately pull focus back
    win.focus();
  });

  // Load dev server or built files
  if (DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL);
  } else {
    const indexPath = join(__dirname, '../dist/index.html');
    win.loadFile(indexPath);
  }

  // Controlled exit shortcut
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());
}

// ─── Spawn the overlay / recorder scanner ───────────────────
if (platform() === 'win32') {
  const scannerExe = join(
    __dirname,
    '../../overlay-scanner/publish/OverlayScanner.exe'
  );
  const scanner = spawn(scannerExe, [], { windowsHide: true });

  scanner.stdout.on('data', data => {
    const line = data.toString().trim();
    console.log('[scanner]', line);
    const type = line.includes('Screen recorder detected')
      ? 'recorder'
      : 'overlay';
    broadcast({ ts: Date.now(), type, line });
  });

  scanner.stderr.on('data', data =>
    console.error('[scanner-err]', data.toString().trim())
  );

  app.on('will-quit', () => scanner.kill());
}

// Ensure the app doesn't quit on window close (kiosk stays alive)
app.on('window-all-closed', () => {});

// Create the window when Electron is ready
app.whenReady().then(createWindow);

// ─── macOS “activate” handler to re-focus or re-create the window ───────────────────
if (process.platform === 'darwin') {
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
