const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    processZipFile: (filePath) => ipcRenderer.invoke('process-zip-file', filePath),
});
