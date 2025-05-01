// secure-browser/electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  quitAfterTimer: () => ipcRenderer.send('quitAfterTimer')
});
