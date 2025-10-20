const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息（带会话 ID）
  sendMessage: (message: string, conversationId: string) =>
    ipcRenderer.invoke('claude:send', { message, conversationId }),

  // 监听消息响应
  onMessage: (callback: (data: any) => void) => {
    // 先移除旧监听器，避免重复
    ipcRenderer.removeAllListeners('claude:message');
    return ipcRenderer.on('claude:message', (_: any, data: any) => callback(data));
  },

  // 监听日志
  onLog: (callback: (data: any) => void) => {
    // 先移除旧监听器，避免重复
    ipcRenderer.removeAllListeners('claude:log');
    return ipcRenderer.on('claude:log', (_: any, data: any) => callback(data));
  },

  // 获取所有日志
  getLogs: () => ipcRenderer.invoke('claude:getLogs'),

  // 获取会话历史
  getHistory: (conversationId: string) => ipcRenderer.invoke('claude:getHistory', conversationId),

  // 清除会话历史
  clearHistory: (conversationId: string) => ipcRenderer.invoke('claude:clearHistory', conversationId),

  // 移除监听器
  removeListener: (channel: string, callback: any) =>
    ipcRenderer.removeListener(channel, callback)
});
