const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('props', {
    mainMenuText: () => 'space game',
    newGame: () => ipcRenderer.invoke('newGame')
})