const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: (usuario, clave) => ipcRenderer.invoke('login', usuario, clave)
});
