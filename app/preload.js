const {contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  hideWindow: () => ipcRenderer.send('window-hide'),
  setAutoLaunch: (checked) => ipcRenderer.invoke('set-auto-launch', checked),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  findFiles: (value, type) => ipcRenderer.invoke('find-files', value, type),
})