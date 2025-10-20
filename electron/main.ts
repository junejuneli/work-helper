import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ClaudeService } from './services/claude.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const claudeService = new ClaudeService();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 开发模式：加载 Vite 开发服务器
  // 生产模式：需要先运行 pnpm build 构建前端
  const isDev = !app.isPackaged; // Electron 打包后才是生产模式

  if (isDev) {
    // 默认使用 5173 端口，如果被占用 Vite 会自动使用 5174
    const vitePort = '5174';
    mainWindow.loadURL(`http://localhost:${vitePort}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return mainWindow;
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  // 处理发送消息请求（带会话 ID）
  ipcMain.handle('claude:send', async (event, data: { message: string; conversationId: string }) => {
    await claudeService.sendMessage(data.message, data.conversationId, event.sender);
  });

  // 获取日志
  ipcMain.handle('claude:getLogs', async () => {
    return claudeService.getLogs();
  });

  // 获取会话历史
  ipcMain.handle('claude:getHistory', async (event, conversationId: string) => {
    return claudeService.getConversationHistory(conversationId);
  });

  // 清除会话历史
  ipcMain.handle('claude:clearHistory', async (event, conversationId: string) => {
    claudeService.clearConversationHistory(conversationId);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
