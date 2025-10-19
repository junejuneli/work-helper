# AI秘书

基于 Electron + React + Claude Code SDK 的桌面AI助手应用

## 技术栈

- **Electron** - 桌面应用框架
- **React** - UI框架
- **Semi Design** - 整体UI组件库
- **@ant-design/x** - 聊天界面组件
- **Claude Code SDK** - AI能力
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发

打开两个终端窗口：

**终端1 - 启动 Vite：**
```bash
pnpm dev
```

**终端2 - 启动 Electron：**
```bash
pnpm dev:electron
```

### 4. 构建

```bash
pnpm build
pnpm build:electron
```

## 项目结构

```
work-helper/
├── electron/          # Electron主进程
│   ├── main.ts       # 主进程入口
│   ├── preload.ts    # 预加载脚本
│   └── services/
│       └── claude.ts # Claude SDK调用
├── src/              # React前端
│   ├── App.tsx       # 根组件
│   ├── main.tsx      # 入口
│   └── pages/
│       └── Chat/     # 聊天界面
└── products/         # 文档
```

## 文档

- [产品文档](./products/产品文档.md)
- [技术架构](./products/技术架构.md)
- [Claude Code深度分析](./products/CLAUDE_CODE_深度分析文档.md)
