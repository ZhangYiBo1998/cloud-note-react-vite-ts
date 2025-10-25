const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  hideWindow: () => ipcRenderer.send('window-hide'),
  setAutoLaunch: (checked) => ipcRenderer.invoke('set-auto-launch', checked),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  selectSaveDirectory: (defaultPath) => ipcRenderer.invoke('select-save-directory', defaultPath),
  getConfigJsonAsync: () => ipcRenderer.invoke('get-config-json-async'),
  updateConfigJsonAsync: () => ipcRenderer.invoke('update-config-json-async'),
})