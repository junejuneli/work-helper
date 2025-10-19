import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.invoke('claude:send', message),
  onMessage: (callback: (data: any) => void) =>
    ipcRenderer.on('claude:message', (_, data) => callback(data)),
  removeListener: (channel: string, callback: any) =>
    ipcRenderer.removeListener(channel, callback)
});
