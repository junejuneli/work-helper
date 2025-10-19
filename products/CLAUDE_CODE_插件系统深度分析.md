# Claude Code 插件系统深度分析文档

## 目录
1. [插件系统概述](#1-插件系统概述)
2. [官方插件详解](#2-官方插件详解)
3. [feature-dev 插件深度解析](#3-feature-dev-插件深度解析)
4. [插件结构与规范](#4-插件结构与规范)
5. [Agent 系统详解](#5-agent-系统详解)
6. [Hook 机制在插件中的应用](#6-hook-机制在插件中的应用)
7. [创建自定义插件指南](#7-创建自定义插件指南)
8. [插件最佳实践](#8-插件最佳实践)
9. [实战应用场景](#9-实战应用场景)
10. [与两个SDK的关系](#10-与两个sdk的关系)

---

## 1. 插件系统概述

### 1.1 什么是 Claude Code 插件

Claude Code 插件是扩展 Claude Code 功能的标准化模块，允许开发者：
- 添加自定义的斜杠命令（Slash Commands）
- 定义专用的 AI 代理（Specialized Agents）
- 实现生命周期钩子（Hooks）
- 封装特定领域的工作流程

### 1.2 插件系统架构

```
.claude-plugin/
├── plugin.json          # 插件元数据
├── commands/            # 斜杠命令定义
│   └── *.md            # 命令提示词模板
├── agents/             # 专用代理定义
│   └── *.md            # 代理提示词模板
└── hooks/              # 生命周期钩子
    └── *.sh/.js/.py    # 钩子脚本
```

### 1.3 官方插件列表

Claude Code 提供了 5 个官方插件：

| 插件名称 | 核心功能 | 价值评分 |
|---------|---------|---------|
| **feature-dev** | 7 阶段完整功能开发工作流 | ⭐⭐⭐⭐⭐ |
| **pr-review-toolkit** | Pull Request 深度审查工具 | ⭐⭐⭐⭐ |
| **commit-commands** | Git 提交消息生成与管理 | ⭐⭐⭐ |
| **agent-sdk-dev** | SDK 风格的开发工作流 | ⭐⭐⭐⭐ |
| **security-guidance** | 安全最佳实践指导 | ⭐⭐⭐ |

---

## 2. 官方插件详解

### 2.1 feature-dev - 功能开发工作流

**核心价值**：提供系统化的 7 阶段功能开发流程

**7 个开发阶段**：

```mermaid
graph LR
    A[Discovery 发现] --> B[Exploration 探索]
    B --> C[Questions 提问]
    C --> D[Design 设计]
    D --> E[Implementation 实现]
    E --> F[Review 审查]
    F --> G[Summary 总结]
```

**详细阶段说明**：

1. **Discovery（发现阶段）**
   - 目标：理解功能请求的核心意图
   - 输出：明确的功能边界和目标陈述
   - 关键问题：这个功能解决什么问题？

2. **Exploration（探索阶段）**
   - 目标：分析现有代码库
   - 工具：使用并行 Agent 探索相关代码
   - 输出：相关文件、函数、依赖关系映射

3. **Questions（提问阶段）**
   - 目标：向用户澄清不确定点
   - 策略：收集所有疑问后一次性提问
   - 输出：明确的技术决策

4. **Design（设计阶段）**
   - 目标：创建技术设计方案
   - 输出：架构图、接口定义、数据流
   - 需要用户批准后才能进入实现

5. **Implementation（实现阶段）**
   - 目标：编写代码实现功能
   - 策略：增量式开发，频繁测试
   - 工具：使用专用 Agent 辅助实现

6. **Review（审查阶段）**
   - 目标：代码质量检查
   - 检查点：测试覆盖、性能、安全性
   - 输出：改进建议和修复

7. **Summary（总结阶段）**
   - 目标：文档化工作成果
   - 输出：变更日志、使用说明、测试结果

### 2.2 pr-review-toolkit - PR 审查工具

**核心功能**：

```typescript
// 提供的审查维度
interface PRReview {
  codeQuality: {
    readability: string;      // 代码可读性
    maintainability: string;  // 可维护性
    complexity: string;       // 复杂度分析
  };

  security: {
    vulnerabilities: Array<{  // 安全漏洞
      severity: 'high' | 'medium' | 'low';
      location: string;
      description: string;
    }>;
  };

  performance: {
    bottlenecks: string[];    // 性能瓶颈
    optimizations: string[];  // 优化建议
  };

  testing: {
    coverage: number;         // 测试覆盖率
    missingTests: string[];   // 缺失的测试
  };
}
```

**使用场景**：
- 自动化代码审查流程
- 团队代码标准执行
- 安全漏洞早期发现

### 2.3 commit-commands - 提交管理

**核心命令**：

```bash
/commit-smart        # 智能分析变更生成提交信息
/commit-convention   # 遵循 Conventional Commits 规范
/commit-amend       # 修改最近的提交
```

**提交信息生成策略**：

```markdown
## 分析流程
1. git diff 分析变更内容
2. git log 学习项目的提交风格
3. 识别变更类型（feature/fix/refactor/docs）
4. 生成符合项目规范的提交信息

## 输出格式
type(scope): subject

body

footer
```

### 2.4 agent-sdk-dev - SDK 开发工作流

**特色**：针对 SDK 和库开发优化的工作流

**关注点**：
- API 设计一致性
- 向后兼容性检查
- 文档完整性
- 示例代码质量
- 类型定义准确性

### 2.5 security-guidance - 安全指导

**安全检查清单**：

```yaml
authentication:
  - 密码强度策略
  - 多因素认证实现
  - 会话管理安全

authorization:
  - 权限模型设计
  - RBAC 实现
  - 最小权限原则

data_protection:
  - 敏感数据加密
  - 安全存储实践
  - 数据传输安全

input_validation:
  - SQL 注入防护
  - XSS 防护
  - CSRF 保护

dependency_security:
  - 依赖漏洞扫描
  - 及时更新策略
```

---

## 3. feature-dev 插件深度解析

### 3.1 插件配置文件

```json
// .claude-plugin/plugin.json
{
  "name": "feature-dev",
  "version": "1.0.0",
  "description": "Comprehensive feature development workflow",
  "commands": {
    "feature-dev": {
      "description": "Start a structured feature development process",
      "template": "commands/feature-dev.md"
    }
  },
  "agents": {
    "code-explorer": {
      "description": "Explore codebase for relevant files",
      "template": "agents/code-explorer.md"
    },
    "code-architect": {
      "description": "Design technical solutions",
      "template": "agents/code-architect.md"
    },
    "code-reviewer": {
      "description": "Review code quality and correctness",
      "template": "agents/code-reviewer.md"
    }
  }
}
```

### 3.2 专用 Agent 详解

#### 3.2.1 code-explorer Agent

**职责**：代码库探索和依赖分析

**工作流程**：

```typescript
async function exploreCodebase(featureDescription: string) {
  // 1. 关键词提取
  const keywords = extractKeywords(featureDescription);

  // 2. 多维度搜索（并行执行）
  const [files, functions, types] = await Promise.all([
    grep({ pattern: keywords, type: 'files_with_matches' }),
    grep({ pattern: keywords, output_mode: 'content' }),
    glob({ pattern: '**/*.d.ts' })
  ]);

  // 3. 依赖分析
  const dependencies = await analyzeDependencies(files);

  // 4. 生成代码地图
  return {
    relevantFiles: files,
    keyFunctions: functions,
    dependencies: dependencies,
    suggestedEntryPoints: identifyEntryPoints(files)
  };
}
```

**输出示例**：

```markdown
## 代码探索结果

### 相关文件 (8 个)
1. src/auth/login.ts:45 - 主登录逻辑
2. src/auth/session.ts:120 - 会话管理
3. src/middleware/auth.ts:23 - 认证中间件
...

### 关键函数
- `authenticateUser()` - src/auth/login.ts:45
- `createSession()` - src/auth/session.ts:120
- `validateToken()` - src/auth/tokens.ts:67

### 依赖关系
auth/login.ts → auth/session.ts → db/users.ts
```

#### 3.2.2 code-architect Agent

**职责**：技术方案设计

**设计输出模板**：

```markdown
## 技术设计方案

### 1. 架构概览
[架构图]

### 2. 接口设计
```typescript
interface FeatureAPI {
  // 公共接口定义
}
```

### 3. 数据流
Request → Validation → Business Logic → Database → Response

### 4. 文件结构
- new_file_1.ts - 负责 X
- new_file_2.ts - 负责 Y
- modified_file.ts - 新增 Z 功能

### 5. 依赖变更
需要新增依赖：
- package-a: ^1.0.0 - 用于 X

### 6. 测试策略
- 单元测试覆盖所有新函数
- 集成测试覆盖主流程
- E2E 测试覆盖用户场景

### 7. 风险评估
- 潜在风险 1：性能问题
  - 缓解措施：添加缓存层
```

#### 3.2.3 code-reviewer Agent

**职责**：代码审查和质量保证

**审查检查表**：

```yaml
code_quality:
  - [ ] 命名规范一致
  - [ ] 函数复杂度合理（圈复杂度 < 10）
  - [ ] 无重复代码
  - [ ] 适当的注释

correctness:
  - [ ] 边界条件处理
  - [ ] 错误处理完整
  - [ ] 类型安全

performance:
  - [ ] 无 N+1 查询
  - [ ] 无不必要的循环
  - [ ] 适当使用缓存

security:
  - [ ] 输入验证
  - [ ] 无硬编码敏感信息
  - [ ] SQL 注入防护

testing:
  - [ ] 单元测试覆盖 > 80%
  - [ ] 边界条件测试
  - [ ] 错误场景测试
```

### 3.3 并行 Agent 执行策略

**feature-dev 的高级技巧**：

```typescript
// 在 Exploration 阶段并行调用多个 Agent
async function explorationPhase() {
  // 单次消息中并行调用 3 个探索 Agent
  const results = await Promise.all([
    TaskAgent.call({
      type: 'code-explorer',
      task: '探索认证相关代码'
    }),
    TaskAgent.call({
      type: 'code-explorer',
      task: '探索数据库模型'
    }),
    TaskAgent.call({
      type: 'code-explorer',
      task: '探索现有测试'
    })
  ]);

  return mergeExplorationResults(results);
}
```

**性能优势**：
- 3 个 Agent 并行执行时间 ≈ 单个 Agent 执行时间
- 大幅减少总体等待时间
- 提高开发效率

---

## 4. 插件结构与规范

### 4.1 标准插件目录结构

```
my-plugin/
├── .claude-plugin/
│   ├── plugin.json              # 必需：插件元数据
│   ├── README.md                # 推荐：插件文档
│   ├── commands/                # 斜杠命令
│   │   ├── my-command.md
│   │   └── another-command.md
│   ├── agents/                  # 专用代理
│   │   ├── my-agent.md
│   │   └── helper-agent.md
│   └── hooks/                   # 生命周期钩子
│       ├── on-tool-call.sh
│       └── on-message.js
└── tests/                       # 可选：插件测试
    └── plugin.test.ts
```

### 4.2 plugin.json 规范

```typescript
interface PluginManifest {
  // 基本信息
  name: string;                    // 插件名称（小写，连字符分隔）
  version: string;                 // 语义化版本号
  description: string;             // 简短描述
  author?: string;                 // 作者信息
  license?: string;                // 开源协议

  // 依赖要求
  claudeCodeVersion?: string;      // 最低 Claude Code 版本
  dependencies?: Record<string, string>;

  // 功能定义
  commands?: Record<string, CommandDefinition>;
  agents?: Record<string, AgentDefinition>;
  hooks?: Record<HookEvent, HookDefinition>;

  // 配置选项
  config?: Record<string, ConfigOption>;
}

interface CommandDefinition {
  description: string;             // 命令描述
  template: string;                // 提示词模板路径
  args?: ArgumentDefinition[];     // 命令参数
}

interface AgentDefinition {
  description: string;             // 代理描述
  template: string;                // 提示词模板路径
  tools?: string[];                // 允许使用的工具
}

interface HookDefinition {
  script: string;                  // 钩子脚本路径
  blocking?: boolean;              // 是否阻塞执行
}
```

### 4.3 命令模板格式

**Markdown 格式的提示词模板**：

```markdown
<!-- commands/my-feature.md -->

You are tasked with {{TASK_DESCRIPTION}}.

## Context
The user has requested: {{USER_REQUEST}}

## Your Workflow
1. First, analyze the request
2. Then, explore the codebase
3. Finally, implement the solution

## Tools Available
You have access to:
- FileRead: Read existing files
- FileEdit: Modify files
- Bash: Run commands
- Task: Call sub-agents

## Output Format
Provide your response in this format:

### Analysis
[Your analysis here]

### Implementation Plan
- [ ] Step 1
- [ ] Step 2

### Questions
[Any clarifying questions]

## Constraints
- NEVER modify files without user approval
- ALWAYS write tests for new code
- Use TypeScript strict mode
```

**变量替换**：

Claude Code 会自动替换模板中的变量：

```markdown
{{USER_REQUEST}}       → 用户的实际请求
{{TASK_DESCRIPTION}}   → 任务描述
{{CODEBASE_PATH}}      → 代码库路径
{{CURRENT_FILE}}       → 当前文件路径
```

---

## 5. Agent 系统详解

### 5.1 什么是 Specialized Agent

Specialized Agent（专用代理）是具有特定职责和工具集的 AI 实例：

```typescript
interface SpecializedAgent {
  name: string;                    // 代理名称
  purpose: string;                 // 核心职责
  allowedTools: string[];          // 可用工具列表
  promptTemplate: string;          // 提示词模板
  constraints: string[];           // 行为约束
}
```

### 5.2 Agent 调用机制

**在命令中调用 Agent**：

```markdown
<!-- commands/complex-feature.md -->

## Phase 1: Code Exploration

Use the Task tool to call the code-explorer agent:

```task
{
  "agent": "code-explorer",
  "task": "Find all authentication-related code",
  "context": "{{USER_REQUEST}}"
}
```

Wait for the agent to complete, then analyze its findings.

## Phase 2: Architecture Design

Use the code-architect agent to design the solution:

```task
{
  "agent": "code-architect",
  "task": "Design a new OAuth2 flow",
  "input": "{{EXPLORATION_RESULTS}}"
}
```
```

**TypeScript API 调用**：

```typescript
import { query } from '@anthropic-ai/claude-code';

async function developFeature(userRequest: string) {
  const session = query({
    prompt: `/feature-dev ${userRequest}`,
    options: {
      // 配置选项
    }
  });

  for await (const message of session) {
    if (message.type === 'agent-start') {
      console.log(`Agent ${message.agent} 开始执行`);
    }

    if (message.type === 'agent-result') {
      console.log(`Agent 结果：`, message.result);
    }
  }
}
```

### 5.3 并行 Agent 执行

**最佳实践：单次消息调用多个 Agent**

```markdown
<!-- 正确做法 -->
I'm going to explore the codebase using multiple agents in parallel.

```task
{"agent": "code-explorer", "task": "Find auth code"}
```

```task
{"agent": "code-explorer", "task": "Find database models"}
```

```task
{"agent": "code-explorer", "task": "Find tests"}
```

All three agents will run concurrently for maximum efficiency.
```

**错误做法**：

```markdown
<!-- 错误：顺序执行，速度慢 -->
First, let me explore auth code...
```task
{"agent": "code-explorer", "task": "Find auth code"}
```

[等待结果]

Now, let me explore database models...
```task
{"agent": "code-explorer", "task": "Find database models"}
```
```

### 5.4 Agent 工具限制

**为 Agent 指定可用工具**：

```json
{
  "agents": {
    "safe-explorer": {
      "description": "Read-only code exploration",
      "template": "agents/safe-explorer.md",
      "tools": [
        "FileRead",
        "Glob",
        "Grep",
        "Bash"
      ]
    },
    "implementer": {
      "description": "Write and modify code",
      "template": "agents/implementer.md",
      "tools": [
        "FileRead",
        "FileEdit",
        "FileWrite",
        "Bash",
        "TodoWrite"
      ]
    }
  }
}
```

**安全考虑**：
- 只读 Agent 不应有 `FileEdit` 权限
- 网络 Agent 应限制 `Bash` 的使用
- 审查 Agent 不应能修改代码

---

## 6. Hook 机制在插件中的应用

### 6.1 可用的 Hook 事件

```typescript
type HookEvent =
  | 'on-session-start'           // 会话开始
  | 'on-session-end'             // 会话结束
  | 'on-message'                 // 收到消息
  | 'on-tool-call'               // 工具调用前
  | 'on-tool-result'             // 工具调用后
  | 'on-user-prompt-submit'      // 用户提交提示词前
  | 'on-error'                   // 错误发生
  | 'on-agent-start'             // Agent 开始执行
  | 'on-agent-end';              // Agent 执行结束
```

### 6.2 Hook 实现示例

**示例 1：代码格式化 Hook**

```bash
#!/bin/bash
# hooks/on-tool-call.sh

# 在 FileEdit 工具调用前自动格式化代码

TOOL_NAME="$1"
TOOL_INPUT="$2"

if [ "$TOOL_NAME" = "FileEdit" ]; then
  FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path')

  # 运行 Prettier
  npx prettier --write "$FILE_PATH"

  echo "✓ 代码已格式化"
fi
```

**示例 2：测试验证 Hook**

```javascript
// hooks/on-tool-result.js

module.exports = async function onToolResult(toolName, toolResult) {
  // FileEdit 后自动运行测试
  if (toolName === 'FileEdit') {
    const filePath = toolResult.file_path;

    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      console.log('运行相关测试...');

      const { execSync } = require('child_process');
      try {
        execSync(`npm test -- ${filePath}`, { stdio: 'inherit' });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: '测试失败，请修复后再提交'
        };
      }
    }
  }
};
```

**示例 3：安全检查 Hook**

```python
# hooks/on-user-prompt-submit.py

import sys
import json
import re

def check_sensitive_data(prompt):
    """检查提示词中是否包含敏感信息"""
    sensitive_patterns = [
        r'password\s*=\s*["\'].*["\']',
        r'api[_-]?key\s*=\s*["\'].*["\']',
        r'secret\s*=\s*["\'].*["\']',
    ]

    for pattern in sensitive_patterns:
        if re.search(pattern, prompt, re.IGNORECASE):
            return {
                "blocked": True,
                "reason": "检测到敏感信息，请使用环境变量"
            }

    return {"blocked": False}

if __name__ == "__main__":
    prompt = sys.argv[1]
    result = check_sensitive_data(prompt)
    print(json.dumps(result))
```

### 6.3 Hook 配置

```json
{
  "hooks": {
    "on-tool-call": {
      "script": "hooks/on-tool-call.sh",
      "blocking": false
    },
    "on-tool-result": {
      "script": "hooks/on-tool-result.js",
      "blocking": true
    },
    "on-user-prompt-submit": {
      "script": "hooks/on-user-prompt-submit.py",
      "blocking": true
    }
  }
}
```

**blocking 参数**：
- `true`：Hook 失败会阻止操作继续
- `false`：Hook 失败仅记录警告

---

## 7. 创建自定义插件指南

### 7.1 快速开始

**步骤 1：创建插件目录**

```bash
mkdir -p my-plugin/.claude-plugin/{commands,agents,hooks}
cd my-plugin
```

**步骤 2：创建 plugin.json**

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "My custom workflow plugin",
  "author": "Your Name",
  "commands": {
    "my-workflow": {
      "description": "Run my custom workflow",
      "template": "commands/my-workflow.md"
    }
  }
}
```

**步骤 3：创建命令模板**

```markdown
<!-- .claude-plugin/commands/my-workflow.md -->

You are helping the user with: {{USER_REQUEST}}

## Your Task
1. Understand the user's request
2. Search the codebase for relevant files
3. Propose a solution
4. Implement after user approval

## Workflow

### Phase 1: Analysis
Use the Grep and Glob tools to find relevant code.

### Phase 2: Proposal
Present your solution plan to the user and wait for approval.

### Phase 3: Implementation
After approval, implement the solution using FileEdit.

### Phase 4: Testing
Run tests to verify your changes.

## Important Rules
- ALWAYS ask for approval before making changes
- ALWAYS write tests for new functionality
- Keep changes minimal and focused
```

**步骤 4：使用插件**

```bash
# 通过环境变量指定插件路径
export CLAUDE_PLUGIN_PATH="./my-plugin"

# 或在 .clauderc 中配置
{
  "plugins": ["./my-plugin"]
}

# 使用命令
claude
> /my-workflow 添加用户登录功能
```

### 7.2 实战案例：创建数据库迁移插件

**需求**：自动生成和执行数据库迁移

**插件结构**：

```
db-migration-plugin/
├── .claude-plugin/
│   ├── plugin.json
│   ├── commands/
│   │   ├── create-migration.md
│   │   └── run-migration.md
│   ├── agents/
│   │   ├── schema-analyzer.md
│   │   └── migration-generator.md
│   └── hooks/
│       └── on-migration-create.sh
```

**plugin.json**：

```json
{
  "name": "db-migration",
  "version": "1.0.0",
  "description": "Database migration helper",
  "commands": {
    "create-migration": {
      "description": "Create a new database migration",
      "template": "commands/create-migration.md",
      "args": [
        {
          "name": "description",
          "type": "string",
          "required": true
        }
      ]
    },
    "run-migration": {
      "description": "Run pending migrations",
      "template": "commands/run-migration.md"
    }
  },
  "agents": {
    "schema-analyzer": {
      "description": "Analyze current database schema",
      "template": "agents/schema-analyzer.md",
      "tools": ["FileRead", "Bash", "Grep"]
    },
    "migration-generator": {
      "description": "Generate migration code",
      "template": "agents/migration-generator.md",
      "tools": ["FileRead", "FileWrite"]
    }
  },
  "hooks": {
    "on-tool-result": {
      "script": "hooks/on-migration-create.sh",
      "blocking": false
    }
  }
}
```

**create-migration.md**：

```markdown
You are creating a database migration: {{ARGS.description}}

## Workflow

### Step 1: Analyze Current Schema
Call the schema-analyzer agent to understand the current database structure.

```task
{
  "agent": "schema-analyzer",
  "task": "Analyze current database schema and models"
}
```

### Step 2: Design Migration
Based on the schema analysis and the user's request ({{ARGS.description}}), design the migration.

Consider:
- What tables need to be created/modified?
- What columns need to be added/removed?
- Are there any data transformations needed?
- What are the rollback steps?

### Step 3: Generate Migration File
Call the migration-generator agent to create the migration file.

```task
{
  "agent": "migration-generator",
  "task": "Generate migration for: {{ARGS.description}}",
  "input": "{{SCHEMA_ANALYSIS}}"
}
```

### Step 4: Validation
After generating the migration:
1. Check for syntax errors
2. Verify rollback logic
3. Test in a development database

### Step 5: Summary
Provide the user with:
- Migration file path
- Migration description
- How to run: `npm run migrate`
- How to rollback: `npm run migrate:rollback`
```

**schema-analyzer.md**：

```markdown
You are analyzing the database schema.

## Your Task
1. Find all model files (usually in `models/` or `src/models/`)
2. Identify the current schema structure
3. Find existing migrations
4. Summarize the schema

## Tools to Use
- Glob: Find model files and migration files
- FileRead: Read model definitions
- Grep: Search for table definitions

## Output Format
```json
{
  "tables": [
    {
      "name": "users",
      "columns": ["id", "email", "password", "created_at"],
      "indexes": ["email"],
      "relations": ["hasMany: posts"]
    }
  ],
  "lastMigration": "2024_01_15_create_users_table",
  "ormType": "sequelize | typeorm | prisma"
}
```
```

**migration-generator.md**：

```markdown
You are generating a database migration file.

## Input
You will receive:
- Current schema analysis: {{INPUT.schema}}
- Migration description: {{INPUT.description}}

## Your Task
Generate a migration file following the project's ORM conventions.

## Migration Template (Sequelize example)

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migration logic
    await queryInterface.createTable('table_name', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // ... other columns
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback logic
    await queryInterface.dropTable('table_name');
  }
};
```

## Important Rules
1. ALWAYS include a down() method for rollback
2. Use transactions for complex migrations
3. Add appropriate indexes
4. Handle existing data if modifying tables
5. Follow the project's naming conventions

## Output
1. Create the migration file in the correct directory
2. Use timestamp-based filename: `YYYYMMDDHHMMSS-description.js`
3. Validate the syntax
4. Provide usage instructions
```

**on-migration-create.sh**：

```bash
#!/bin/bash
# hooks/on-migration-create.sh

TOOL_NAME="$1"
TOOL_RESULT="$2"

if [ "$TOOL_NAME" = "FileWrite" ]; then
  FILE_PATH=$(echo "$TOOL_RESULT" | jq -r '.file_path')

  # 检查是否是迁移文件
  if [[ "$FILE_PATH" == *"migrations/"* ]]; then
    echo "✓ 迁移文件已创建: $FILE_PATH"
    echo ""
    echo "后续步骤："
    echo "1. 检查迁移文件内容"
    echo "2. 在开发环境测试: npm run migrate:dev"
    echo "3. 测试回滚: npm run migrate:rollback"
    echo "4. 提交到版本控制"
  fi
fi
```

**使用示例**：

```bash
# 创建新迁移
claude
> /create-migration 添加用户角色字段

# 插件会自动：
# 1. 分析当前 users 表结构
# 2. 设计添加 role 字段的迁移
# 3. 生成迁移文件
# 4. 提供测试和运行指导

# 运行迁移
> /run-migration
```

---

## 8. 插件最佳实践

### 8.1 设计原则

**1. 单一职责原则**

```markdown
✓ 好的插件设计
- feature-dev: 专注于功能开发流程
- pr-review: 专注于代码审查
- commit-commands: 专注于提交管理

✗ 不好的设计
- super-plugin: 包含开发、测试、部署、监控所有功能
```

**2. 可组合性**

```json
// 插件可以依赖其他插件
{
  "name": "full-stack-dev",
  "dependencies": {
    "feature-dev": "^1.0.0",
    "pr-review-toolkit": "^1.0.0"
  }
}
```

**3. 渐进式增强**

```markdown
## 基础命令
/create-component Button

## 高级命令（可选参数）
/create-component Button --with-tests --with-stories

## 专家模式（完整配置）
/create-component Button --config component.config.json
```

### 8.2 性能优化

**1. 并行 Agent 调用**

```markdown
<!-- 优化前：顺序执行，耗时 3x -->
Step 1: Explore auth code (30s)
Step 2: Explore DB models (30s)
Step 3: Explore tests (30s)
Total: 90s

<!-- 优化后：并行执行，耗时 1x -->
Parallel exploration:
- Auth code
- DB models
- Tests
Total: 30s
```

**2. 缓存策略**

```javascript
// hooks/on-session-start.js
const fs = require('fs');
const path = require('path');

const CACHE_FILE = '.claude-cache/codebase-map.json';

module.exports = async function onSessionStart() {
  // 检查缓存
  if (fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const age = Date.now() - cache.timestamp;

    // 缓存有效期 1 小时
    if (age < 3600000) {
      console.log('✓ 使用缓存的代码库映射');
      return { codebaseMap: cache.data };
    }
  }

  console.log('重新构建代码库映射...');
  // 重新扫描代码库
};
```

**3. 增量更新**

```markdown
## 首次运行
- 完整扫描代码库
- 建立索引
- 耗时：2 分钟

## 后续运行
- 只扫描变更文件（通过 git diff）
- 增量更新索引
- 耗时：5 秒
```

### 8.3 错误处理

**1. 优雅降级**

```markdown
## Phase 1: Try Parallel Exploration
```task
{"agent": "code-explorer", "task": "Find auth code"}
```
```task
{"agent": "code-explorer", "task": "Find DB models"}
```

If any agent fails, I'll fall back to manual search using Grep and Glob.

## Phase 2: Fallback Strategy
[Manual search with basic tools]
```

**2. 详细错误信息**

```javascript
// agents/safe-agent.md
try {
  // 执行任务
} catch (error) {
  return {
    success: false,
    error: {
      message: error.message,
      context: "在分析数据库模型时失败",
      suggestion: "请检查 models/ 目录是否存在",
      fallback: "可以手动指定模型文件路径"
    }
  };
}
```

**3. 用户友好的提示**

```markdown
❌ 错误的提示:
Error: Command failed

✓ 好的提示:
⚠️  无法找到测试文件

可能的原因：
1. 项目还没有设置测试框架
2. 测试文件在非标准目录

建议操作：
- 运行 `/setup-tests` 来配置测试
- 或手动指定测试目录: `/run-tests --dir custom/path`
```

### 8.4 文档化

**1. README 结构**

```markdown
# Plugin Name

## 描述
一句话说明插件用途

## 安装
npm install @claude/plugin-name

## 使用

### 基础用法
/command-name [args]

### 高级用法
[详细示例]

## 命令参考

### /command-1
描述、参数、示例

### /command-2
描述、参数、示例

## 配置

### 插件配置
.clauderc 配置说明

### Hook 配置
Hook 的使用和配置

## 常见问题

Q: 问题1
A: 答案1

## 贡献指南
如何贡献代码

## 许可证
MIT
```

**2. 内联文档**

```markdown
<!-- commands/complex-workflow.md -->

<!--
命令: /complex-workflow
参数:
  - feature: 功能描述 (required)
  - --skip-tests: 跳过测试 (optional)
示例: /complex-workflow "add login" --skip-tests
-->

You are implementing: {{ARGS.feature}}
...
```

**3. 类型定义**

```typescript
// types/plugin.d.ts

/**
 * 插件配置接口
 */
export interface PluginConfig {
  /**
   * 插件名称
   * @example "my-plugin"
   */
  name: string;

  /**
   * 语义化版本号
   * @example "1.0.0"
   */
  version: string;

  // ... 其他配置
}
```

---

## 9. 实战应用场景

### 9.1 场景 1：全栈功能开发

**需求**：实现"用户个人资料编辑"功能

**使用插件**：`feature-dev`

**完整流程**：

```bash
claude
> /feature-dev 实现用户个人资料编辑功能，包括头像上传

# Phase 1: Discovery
Claude: 我理解您需要：
- 用户可以编辑个人信息（姓名、邮箱、简介等）
- 支持头像上传
- 需要表单验证
- 需要后端 API

是否正确？

User: 是的

# Phase 2: Exploration
Claude: 正在并行探索代码库...
- 探索现有用户模型
- 探索文件上传逻辑
- 探索表单组件

发现：
- 用户模型: src/models/User.ts
- 已有文件上传: src/services/upload.ts
- 表单组件: src/components/Form/

# Phase 3: Questions
Claude: 有几个需要确认的问题：
1. 头像文件大小限制是多少？
2. 是否需要头像裁剪功能？
3. 保存时是否需要旧密码验证？

User:
1. 5MB
2. 需要
3. 需要

# Phase 4: Design
Claude: 这是技术设计方案：

## 架构
Frontend (ProfileEdit.tsx)
  → API (PUT /api/users/:id)
    → Service (updateProfile)
      → Database

## 新增文件
- src/pages/ProfileEdit.tsx - 个人资料编辑页面
- src/components/AvatarUpload.tsx - 头像上传组件
- src/services/profile.ts - 个人资料服务
- src/api/profile.ts - API 路由

## 修改文件
- src/models/User.ts - 添加头像字段
- src/middleware/auth.ts - 添加密码验证

## 数据流
1. 用户上传头像 → AvatarUpload 组件
2. 裁剪并压缩 → 上传到 S3
3. 更新表单 → 验证所有字段
4. 提交 → 验证旧密码
5. 保存 → 更新数据库
6. 返回 → 刷新 UI

批准后开始实现？

User: 批准

# Phase 5: Implementation
Claude: 开始实现...

[创建 ProfileEdit.tsx]
[创建 AvatarUpload.tsx]
[创建 profile.ts]
[修改 User.ts]
...

# Phase 6: Review
Claude: 调用 code-reviewer agent 审查代码...

审查结果：
✓ 代码质量良好
✓ 测试覆盖 85%
⚠️ 建议添加图片压缩以提升性能
✓ 安全性检查通过

# Phase 7: Summary
Claude: 功能实现完成！

变更摘要：
- 新增 4 个文件
- 修改 2 个文件
- 添加 12 个单元测试
- 添加 3 个集成测试

使用方法：
1. 访问 /profile/edit
2. 上传新头像
3. 编辑信息
4. 输入旧密码确认
5. 保存

测试：
- npm test -- profile
- 手动测试：访问 http://localhost:3000/profile/edit
```

### 9.2 场景 2：代码审查流程

**需求**：审查 PR #123

**使用插件**：`pr-review-toolkit`

**流程**：

```bash
claude
> /review-pr 123

# 插件自动执行：

## 1. 获取 PR 信息
gh pr view 123 --json title,body,files

## 2. 分析变更
- 23 个文件变更
- +456 行添加
- -123 行删除

## 3. 多维度审查

### 代码质量
✓ 命名规范一致
✓ 函数复杂度合理
⚠️ src/utils/helper.ts:45 - 函数过长（70 行），建议拆分

### 性能
⚠️ src/api/users.ts:34 - 潜在的 N+1 查询问题
建议：使用 include 预加载关联数据

### 安全性
❌ src/controllers/auth.ts:89 - 密码未加密直接存储
必须修复：使用 bcrypt 加密密码

✓ 输入验证完善
✓ 无 SQL 注入风险

### 测试
✓ 测试覆盖率 82%
⚠️ 缺少边界条件测试
建议添加：
- 空字符串输入测试
- 超长输入测试
- 并发请求测试

## 4. 生成审查报告

已在 PR #123 添加评论：

总体评估：需要修改后批准

必须修复（Blocking）：
- [ ] 密码加密问题

建议优化（Non-blocking）：
- [ ] N+1 查询优化
- [ ] 函数拆分
- [ ] 添加边界测试

优点：
- 代码结构清晰
- 错误处理完善
- 文档完整
```

### 9.3 场景 3：API 端点开发

**需求**：创建新的 REST API 端点

**使用插件**：`agent-sdk-dev`

**流程**：

```bash
claude
> /create-endpoint GET /api/posts/:id/comments

# Phase 1: API 设计
Claude: 设计 API 端点...

## Endpoint
GET /api/posts/:id/comments

## Query Parameters
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- sort: 'newest' | 'oldest' | 'popular'

## Response
```json
{
  "data": [
    {
      "id": "string",
      "content": "string",
      "author": {
        "id": "string",
        "name": "string",
        "avatar": "string"
      },
      "createdAt": "ISO 8601 string",
      "likes": number
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

## Error Responses
- 404: Post not found
- 400: Invalid parameters
- 500: Server error

批准设计？

User: 批准

# Phase 2: 实现

## 1. 创建路由
// src/routes/posts.ts
router.get('/:id/comments', getComments);

## 2. 创建控制器
// src/controllers/posts.ts
export async function getComments(req, res) {
  // 实现逻辑
}

## 3. 创建服务
// src/services/comments.ts
export async function getPostComments(postId, options) {
  // 数据库查询
}

## 4. 添加验证
// src/validators/comments.ts
export const getCommentsSchema = {
  // Joi/Zod schema
}

## 5. 编写测试
// tests/api/comments.test.ts
describe('GET /api/posts/:id/comments', () => {
  // 测试用例
});

# Phase 3: 文档生成

已自动生成 OpenAPI 文档：

```yaml
/api/posts/{id}/comments:
  get:
    summary: Get comments for a post
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    responses:
      200:
        description: Success
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CommentsResponse'
```

# Phase 4: 示例代码生成

JavaScript 示例：
```javascript
const response = await fetch('/api/posts/123/comments?page=1&limit=20');
const { data, pagination } = await response.json();
```

TypeScript 示例：
```typescript
interface Comment {
  id: string;
  content: string;
  // ...
}

const comments: Comment[] = await api.getPostComments('123', {
  page: 1,
  limit: 20
});
```

完成！
```

### 9.4 场景 4：重构遗留代码

**需求**：重构旧的回调式代码为 async/await

**自定义插件**：`refactor-async`

**插件实现**：

```json
// .claude-plugin/plugin.json
{
  "name": "refactor-async",
  "commands": {
    "refactor-callbacks": {
      "description": "Convert callbacks to async/await",
      "template": "commands/refactor-callbacks.md"
    }
  },
  "agents": {
    "callback-finder": {
      "description": "Find callback patterns",
      "template": "agents/callback-finder.md"
    },
    "async-converter": {
      "description": "Convert to async/await",
      "template": "agents/async-converter.md"
    }
  }
}
```

```markdown
<!-- commands/refactor-callbacks.md -->

## Task: Convert Callbacks to Async/Await

### Step 1: Find Callback Patterns
```task
{"agent": "callback-finder", "task": "Find all callback-based code"}
```

### Step 2: Analyze Dependencies
For each callback pattern found:
- Check if the library supports promises
- Identify nested callback hell
- Plan conversion strategy

### Step 3: Convert Code
```task
{
  "agent": "async-converter",
  "task": "Convert callbacks to async/await",
  "input": "{{CALLBACK_PATTERNS}}"
}
```

### Step 4: Update Tests
- Convert test callbacks to async/await
- Use async test runners

### Step 5: Verify
- Run all tests
- Check for unhandled promise rejections
- Verify error handling
```

**使用示例**：

```bash
claude
> /refactor-callbacks src/services/database.ts

# 自动分析
发现 15 个回调模式：
1. fs.readFile(path, (err, data) => {})
2. db.query(sql, (err, results) => {})
...

# 转换建议
Will convert:
```javascript
// Before
function getUser(id, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}
```

To:
```javascript
// After
async function getUser(id) {
  const results = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return results[0];
}
```

批准转换？

User: 是的

# 执行转换并更新所有调用点
✓ 转换完成
✓ 测试通过
✓ 代码更简洁
```

---

## 10. 与两个SDK的关系

### 10.1 架构层次

```
┌─────────────────────────────────────────┐
│         User Application                │
│    (你的 AI 辅助应用)                    │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│      Claude Code Plugin System          │
│   (插件扩展层)                           │
│   - feature-dev                         │
│   - pr-review-toolkit                   │
│   - your-custom-plugin                  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│    @anthropic-ai/claude-code            │
│   (高级封装层)                           │
│   - query() API                         │
│   - 18+ Tools                           │
│   - Agent System                        │
│   - Hook Mechanism                      │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│      @anthropic-ai/sdk                  │
│   (基础 API 层)                          │
│   - Messages API                        │
│   - Streaming                           │
│   - Tool Use                            │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│      Anthropic API Server               │
│   (Claude AI 后端)                       │
└─────────────────────────────────────────┘
```

### 10.2 插件如何使用两个 SDK

**场景 1：只使用 Claude Code**

```typescript
// 在插件命令模板中
// commands/my-workflow.md

You have access to these tools:
- FileRead
- FileEdit
- Grep
- Glob
- Task (call sub-agents)

Use them to complete the user's request.
```

这种方式：
- 插件通过提示词模板指导 Claude
- Claude 自动调用 claude-code 的工具
- 不需要直接编程

**场景 2：使用 Claude Code SDK**

```typescript
// 在 Hook 脚本中调用 SDK
// hooks/on-session-start.js

const { query } = require('@anthropic-ai/claude-code');

module.exports = async function onSessionStart() {
  // 使用 SDK 启动子会话
  const session = query({
    prompt: '分析项目依赖并生成报告',
    options: {
      permissionMode: 'default'
    }
  });

  for await (const message of session) {
    if (message.type === 'text') {
      console.log(message.content);
    }
  }
};
```

这种方式：
- 在 Hook 中编程控制
- 可以启动子会话
- 可以复杂的流程控制

**场景 3：直接使用 Anthropic SDK**

```typescript
// hooks/custom-ai-call.js

const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function customAICall() {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  // 绕过 claude-code，直接调用 API
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: '总结这个项目的架构'
    }]
  });

  return message.content[0].text;
};
```

这种方式：
- 完全控制 API 调用
- 不使用 claude-code 的工具系统
- 适合特殊需求

### 10.3 选择建议

**使用 Claude Code（推荐）**：
- ✓ 开发代码辅助插件
- ✓ 需要文件操作、代码搜索等工具
- ✓ 需要 Agent 系统
- ✓ 需要权限控制

**使用 Anthropic SDK**：
- ✓ 需要完全控制 API 参数
- ✓ 实现纯对话功能（无工具）
- ✓ 批量 API 调用
- ✓ 特殊的流式处理需求

**混合使用**：
- ✓ 主流程用 Claude Code
- ✓ 特殊子任务用 Anthropic SDK
- ✓ 获得两者的优势

---

## 总结

### 核心要点

1. **插件系统的价值**
   - 标准化工作流程
   - 封装领域知识
   - 提高开发效率
   - 可复用可分享

2. **三大组件**
   - **Slash Commands**：用户入口
   - **Specialized Agents**：执行引擎
   - **Hooks**：生命周期控制

3. **最佳实践**
   - 单一职责
   - 并行执行
   - 优雅错误处理
   - 完善文档

4. **与 SDK 的关系**
   - Claude Code = 高级工具层
   - Anthropic SDK = 基础 API 层
   - 插件 = 应用扩展层

### 学习路径

1. **入门**：使用官方插件（feature-dev）
2. **进阶**：修改官方插件
3. **高级**：创建自定义插件
4. **专家**：贡献插件生态

### 下一步

- 尝试使用 `/feature-dev` 开发一个功能
- 阅读官方插件源码
- 创建你的第一个自定义插件
- 加入 Claude Code 社区

---

**文档版本**：1.0.0
**最后更新**：2025-10-18
**作者**：AI 助手
**联系方式**：通过 GitHub Issues 反馈
