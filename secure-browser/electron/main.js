import { app, BrowserWindow, globalShortcut } from 'electron';

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