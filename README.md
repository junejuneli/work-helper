# AI 秘书 - Linda

一款桌面端 AI 助手应用，让每个人拥有自己的 AI 秘书。

> **开发者注意**: 请先阅读 [CLAUDE.md](./CLAUDE.md) 了解项目的开发规范和约定。

## 功能特性

### 🌟 Linda - 你的 AI 秘书
Linda 不是冰冷的 AI 工具，而是一个温暖、智能、专业的工作伙伴：
- **人格化交互** - 温暖体贴，提供情绪价值
- **智能澄清** - 分级澄清策略（Level 1-3），确保准确理解需求
- **质量把控** - 6 维度质检（完整性、准确性、格式、可读性、专业性、一致性）
- **透明可靠** - 显示进度、解释决策、问题可追溯

### 💻 技术特性
- 💬 **流式对话** - 实时响应，自然交互体验
- 🎨 **精美界面** - Semi Design + Ant Design X
- 🖥️ **跨平台** - 基于 Electron，支持 Windows/Mac/Linux
- 🌐 **双模式** - 支持浏览器预览和 Electron 完整功能
- 📊 **日志监控** - CLI 交互日志实时展示
- 💾 **会话管理** - 多会话支持，对话历史持久化

## 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面框架**: Electron 32
- **UI 组件库**: Semi Design + @ant-design/x
- **构建工具**: Vite 6
- **AI SDK**: @anthropic-ai/claude-agent-sdk (Claude Agent SDK)
- **包管理器**: pnpm

## 快速开始

### 前置要求

- Node.js 18+
- pnpm 9+

### 1. 安装依赖

```bash
pnpm install
```

### 2. 运行项目

#### 推荐方式：完整功能开发模式

**步骤 1：启动 Vite 开发服务器**

在终端 1 中运行：
```bash
pnpm dev
```

等待看到：
```
VITE v6.4.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

**步骤 2：启动 Electron 应用**

在终端 2 中运行：
```bash
pnpm run dev:electron
```

**重要提示**：
- ⚠️ **必须先启动 Vite**（步骤 1），否则 Electron 会白屏
- Electron 会自动连接到 `http://localhost:5173`
- 如果 Vite 使用了其他端口（如 5174），需要手动修改 electron/main.ts 中的端口号

现在 Electron 窗口会自动打开，您可以：
- ✅ 与 Linda AI 秘书对话
- ✅ 查看对话日志
- ✅ 使用完整的 Claude API 功能
- ✅ 自动打开 DevTools 调试
- ✅ 热更新（修改前端代码会自动刷新）

**在哪里查看日志？**
- **前端日志**：Electron 窗口中按 `Cmd+Option+I` (Mac) 或 `F12` (Windows/Linux) 打开 DevTools
- **后端日志**：查看启动 Electron 的终端窗口（会显示 Session 创建、恢复等信息）
- **应用内日志**：点击应用右侧的"对话日志"面板

#### 可选方式：仅浏览器预览（UI 调试）

```bash
pnpm dev
```

然后在浏览器中打开 http://localhost:5173

特点：
- ✅ 可以调试前端 UI
- ✅ 支持热更新 (HMR)
- ❌ 无法与 Claude API 交互（使用 mock 数据）

### 构建

```bash
# 构建前端
pnpm build

# 构建 Electron
pnpm build:electron
```

## 项目结构

```
work-helper/
├── electron/                # Electron 主进程
│   ├── main.ts             # 主进程入口
│   ├── preload.ts          # 预加载脚本
│   └── services/
│       └── claude.ts       # Claude API 服务
│
├── src/                    # React 渲染进程
│   ├── main.tsx           # 入口文件
│   ├── App.tsx            # 根组件
│   ├── index.css          # 全局样式
│   ├── pages/
│   │   └── Chat/          # 聊天页面
│   │       └── index.tsx
│   └── global.d.ts        # TypeScript 类型定义
│
├── products/              # 产品文档
│   ├── 产品文档.md
│   └── 技术架构.md
│
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置（前端）
├── tsconfig.node.json     # TypeScript 配置（Electron）
└── vite.config.ts         # Vite 配置
```

## 常见问题

### 1. Electron 无法启动

确保先启动 Vite 服务器：
```bash
pnpm dev
```

### 2. 端口冲突

如果 5173 端口被占用，Vite 会自动使用其他端口。查看终端输出获取实际端口。

### 3. 前端报错 "Cannot read properties of undefined"

这是正常的！在浏览器模式下，`window.electronAPI` 不存在。代码已做兼容处理，会使用 mock 数据。

### 4. API Key 在哪里配置？

所有配置都直接硬编码在代码中，无需配置环境变量。详见 [CLAUDE.md](./CLAUDE.md)。

## 产品文档

详细的产品定义和技术架构请查看：
- [产品文档.md](./products/产品文档.md)
- [技术架构.md](./products/技术架构.md)

## 当前状态

### ✅ 已完成
- [x] 基础项目架构
- [x] Electron + React + TypeScript 集成
- [x] Semi Design UI 框架
- [x] @ant-design/x 聊天组件
- [x] Claude Agent SDK 集成
- [x] **Session 管理机制**
  - [x] Agent 定义与注册（每个 Agent 有全局唯一 UUID）
  - [x] Agent Session 管理（每个 Agent 在每个群聊中只有一个 Session）
  - [x] 会话连续性（通过 SDK 的 `resume` 参数保持上下文）
  - [x] Session 自动创建与恢复
- [x] Linda 人格化 System Prompt（温暖、智能、专业）
- [x] 智能澄清机制（分级澄清策略 Level 1-3）
- [x] 浏览器/Electron 双模式支持
- [x] 欢迎消息和快速开始提示词
- [x] 清空会话功能（同时清除 Session）
- [x] CLI 交互日志面板
- [x] 多会话管理（linda、work-group、data-analysis）
- [x] 对话历史持久化（基于内存）
- [x] 流式响应优化（避免重复显示）

### 🚧 开发中
- [ ] Linda 智能任务分发
- [ ] AI 员工体系
- [ ] 工作群机制
- [ ] 本地文件集成
- [ ] 多员工协作

### 📋 计划中
- [ ] 员工管理界面
- [ ] 工作群创建与管理
- [ ] 文件拖拽上传
- [ ] 任务进度展示
- [ ] 质量检查反馈

## License

ISC
