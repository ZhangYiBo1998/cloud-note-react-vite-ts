const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  hideWindow: () => ipcRenderer.send('window-hide'),
  setAutoLaunch: (checked) => ipcRenderer.invoke('set-auto-launch', checked),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  selectSaveDirectory: (defaultPath) => ipcRenderer.invoke('select-save-directory', defaultPath),
  getConfigJsonAsync: (force) => ipcRenderer.invoke('get-config-json-async', force),
  updateConfigJsonAsync: (newConfigJson) => ipcRenderer.invoke('update-config-json-async', newConfigJson),
  getNoteGroupsAsync: (saveDir) => ipcRenderer.invoke('get-note-groups-async', saveDir),
  updateGroupsConfigAsync: (newGroupsConfig) => ipcRenderer.invoke('update-groups-config-async', newGroupsConfig),
  createNoteAsync: (options) => ipcRenderer.invoke('create-note-async', options),
  readNoteAsync: (noteKey) => ipcRenderer.invoke('read-note-async', noteKey),
})