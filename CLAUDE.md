# Claude 开发备忘录

这个文件记录了项目开发中的重要规范、约定和注意事项。

## 🚨 核心规范

### 1. 禁止使用环境变量和 .env 文件

**❌ 不要做：**
- 不要创建或使用 `.env` 文件
- 不要使用 `process.env.XXX` 读取环境变量
- 不要在文档中要求用户配置环境变量

**✅ 应该做：**
- 所有配置直接硬编码在代码中
- API Key、配置项等直接写在代码里
- 如果需要切换配置，在代码中使用常量

**示例：**
```typescript
// ❌ 错误
const apiKey = process.env.ANTHROPIC_API_KEY;

// ✅ 正确
const apiKey = 'sk-ant-xxx...直接写在这里';
```

### 2. Session 管理规范

#### Session 的正确理解

- **Session ID 由 Claude Agent SDK 自动生成**，不是我们手动创建的
- 首次调用 `query()` 时，SDK 会在 `system` 消息（`subtype: 'init'`）中返回 `session_id`
- 后续调用时，使用 `resume: sessionId` 参数来恢复之前的会话

#### 架构设计

```
群聊（Conversation）
  └─ Agent（如 Linda、数据分析师）
      └─ Session（由 SDK 管理）
```

- 每个 **Agent** 有全局唯一的 UUID
- 每个 Agent 在每个**群聊**中只有**一个 Session**
- Session Key: `conversationId:agentId`
- Session ID 在首次对话时从 SDK 获取，后续使用 `resume` 恢复

#### 代码实现要点

```typescript
// 1. Agent Session 定义
interface AgentSession {
  agentId: string;
  conversationId: string;
  sessionId?: string; // 首次为空，从 SDK 获取
}

// 2. 首次对话 - 不传 resume
const response = query({
  prompt: message,
  options: {
    model: 'claude-sonnet-4-5',
    systemPrompt: agent.systemPrompt
  }
});

// 3. 处理响应，获取 session_id
for await (const msg of response) {
  if (msg.type === 'system' && msg.subtype === 'init') {
    const sessionId = msg.session_id;
    // 保存 sessionId 供后续使用
  }
}

// 4. 后续对话 - 使用 resume 恢复
const response = query({
  prompt: message,
  options: {
    model: 'claude-sonnet-4-5',
    systemPrompt: agent.systemPrompt,
    resume: sessionId // 恢复之前的会话
  }
});
```

### 3. 日志处理规范

#### 日志重复问题的避免

**问题根源：**
- 后端既通过 `addLog()` 存储日志，又通过 `webContents.send('claude:log')` 发送实时事件
- 前端既监听实时日志，又调用 `loadLogs()` 加载历史日志
- 导致同一条日志被添加两次

**解决方案：**
- 前端只监听实时日志事件 `onLog`，不自动加载历史
- 用户可以通过"刷新"按钮手动加载历史日志

#### 消息重复问题的避免

**问题根源：**
- Claude Agent SDK 返回多种消息类型：`system`、`assistant`、`result`
- `assistant` 消息和 `result` 消息可能包含相同的内容
- 如果同时处理两种消息，会导致响应显示两次

**解决方案：**
- 只处理 `result` 类型消息（包含完整的最终响应）
- 不处理 `assistant` 类型消息（除非需要逐字流式显示）

```typescript
for await (const msg of response) {
  // 只处理 result 消息
  if (msg.type === 'result') {
    const result = msg.result;
    // 发送到前端显示
  }
  // 不处理 assistant 消息，避免重复
}
```

## 📁 项目结构

```
work-helper/
├── electron/              # Electron 主进程
│   ├── main.ts           # 主进程入口
│   ├── preload.ts        # 预加载脚本
│   └── services/
│       └── claude.ts     # Claude Agent SDK 服务（核心逻辑）
├── src/                  # React 渲染进程
│   ├── main.tsx         # 入口文件
│   ├── App.tsx          # 根组件
│   ├── pages/Chat/      # 聊天页面
│   └── components/      # 组件（如 LogPanel）
└── products/            # 产品文档
```

## 🔧 技术栈

- **前端**: React 18 + TypeScript + Vite 6
- **桌面**: Electron 32
- **UI 库**: Semi Design + @ant-design/x
- **AI SDK**: @anthropic-ai/claude-agent-sdk
- **包管理**: pnpm

## 🎯 开发原则

1. **极简原则**: 最少依赖，极简实现
2. **不要环境变量**: 所有配置硬编码
3. **用户体验优先**: Linda 的温度比技术炫技更重要
4. **渐进式开发**: MVP 先行，逐步迭代

## 📦 Claude Agent SDK 配置

### 工作目录 (cwd)

Claude Agent SDK 在运行时可能会创建临时文件或 session 文件。默认情况下，这些文件会被存储在系统的临时目录（如 `/tmp`），不方便查找和管理。

**配置方法：**

在 `electron/services/claude.ts` 中，通过 `query()` 的 `options.cwd` 参数指定工作目录：

```typescript
import { homedir } from 'os';
import { join } from 'path';

// 设置工作目录为桌面
const desktopPath = join(homedir(), 'Desktop');

const response = query({
  prompt: message,
  options: {
    model: 'claude-sonnet-4-5',
    systemPrompt: agent.systemPrompt,
    cwd: desktopPath,  // SDK 创建的文件会存储在桌面
    // ... 其他配置
  }
});
```

**代码位置**: `electron/services/claude.ts:328-336`

**效果**:
- Session 文件、transcript 等会存储在 `~/Desktop` 目录
- 方便查找和调试 SDK 生成的文件
- 可以根据需要修改为其他目录（如项目目录、Documents 等）

## 🐛 常见问题及解决方案

### 1. 日志重复显示
- **原因1**: 前端同时监听实时日志和加载历史日志
  - **解决**: 移除自动加载历史，只监听实时事件
  - **代码位置**: `src/components/LogPanel.tsx:28-42`
- **原因2**: IPC 监听器累积（每次调用 `onLog` 都添加新监听器）
  - **解决**: ✅ 已修复 - 在 preload.ts 中调用 `ipcRenderer.removeAllListeners()` 清理旧监听器
  - **代码位置**: `electron/preload.ts:16-20`
  - **修复代码**:
    ```typescript
    // 监听日志
    onLog: (callback: (data: any) => void) => {
      // 先移除旧监听器，避免重复
      ipcRenderer.removeAllListeners('claude:log');
      return ipcRenderer.on('claude:log', (_: any, data: any) => callback(data));
    }
    ```

### 2. 响应显示两次
- **原因**: 同时处理 `assistant` 和 `result` 消息
- **解决**: 只处理 `result` 消息

### 3. Session 不连续
- **原因**: 每次都创建新 session，没有使用 `resume`
- **解决**: 保存 SDK 返回的 `session_id`，后续使用 `resume` 参数

### 4. API Key 配置问题
- **原因**: 使用环境变量，用户配置困难
- **解决**: 直接硬编码在代码中

### 5. Electron 白屏问题
- **原因**:
  - 没有先启动 Vite 开发服务器
  - 或者端口不匹配（Vite 在 5174，Electron 连接 5173）
- **解决**:
  - **必须先运行 `pnpm dev` 启动 Vite**
  - 然后再运行 `pnpm run dev:electron`
  - 确保 Electron main.ts 中的端口与 Vite 端口一致
- **代码位置**: `electron/main.ts:29` - `const vitePort = '5173';`

## 📝 更新日志

### 2025-10-20
- ✅ 实现 Session 管理机制（Agent + Session 架构）
- ✅ 修复日志重复显示问题（IPC 监听器累积）
- ✅ 修复响应重复显示问题
- ✅ 修复 Electron 白屏问题（移除环境变量依赖）
- ✅ 明确禁止使用环境变量的规范
- ✅ 优化开发体验（自动打开 DevTools，端口自适应）
- ✅ 配置 SDK 工作目录为桌面（方便查找 SDK 创建的文件）

## 🔗 相关文档

- [产品文档](./products/产品文档.md)
- [技术架构](./products/技术架构.md)
- [更新日志](./CHANGELOG.md)
- [README](./README.md)
