# 项目目录与结构规范 (Project Structure)

## 1. Monorepo 总体工作区结构

```text
cym-test-agent/
├── .agents/                             # Antigravity AI Customizations (Skills, Rules)
│   └── skills/
│       └── cym-context/
│           └── SKILL.md
├── docs/                                # 详细项目参考知识库 (cym-context 维护)
│   ├── README.md                        # 知识库主导航入口
│   ├── index.json                       # 结构化文档索引元数据
│   ├── project/                         # 项目级定义 (目标、需求、业务规则、技术栈、结构)
│   ├── architecture/                    # 架构蓝图、组件边界、调用流、部署
│   ├── contracts/                       # 协议信封、事件流、DTO 校验契约
│   ├── data/                            # 数据库模型与存储设计
│   ├── engineering/                     # 工程开发指南与测试规范
│   ├── frontend/                        # TUI/Web 终端与交互设计
│   ├── modules/                         # 关键模块设计与调用流
│   ├── changes/                         # 需求变更与 CHANGELOG 历史
│   ├── decisions/                       # 架构决策记录 (ADR)
│   └── risks/                           # 技术债与风险跟踪
├── packages/                            # Monorepo 核心子包源码
│   ├── protocol/                        # @testagent/protocol (统一协议、实体、事件、权限与评分)
│   │   ├── src/
│   │   │   ├── context.ts               # 上下文分段与生命周期模型
│   │   │   ├── entities.ts              # 核心实体接口 (EvalDataset, EvalCase, Session, Run 等)
│   │   │   ├── envelope.ts              # 通信信封与握手协议
│   │   │   ├── events.ts                # Agent 事件流定义
│   │   │   ├── index.ts                 # 模块统一导出入口
│   │   │   ├── permissions.ts           # Capability 权限策略引擎
│   │   │   ├── provider.ts              # Model Provider 适配层抽象
│   │   │   ├── sandbox.ts               # 沙箱执行抽象接口
│   │   │   └── scoring.ts               # 五维加权综合评分计算
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── tui/                             # @testagent/tui (键盘优先 React Ink 终端客户端)
│       ├── src/
│       │   ├── cli.tsx                  # 终端主交互入口与键盘事件分发
│       │   ├── components/              # 终端 UI 组件 (Header, TraceDAG, DiffViewer, ScoreCard 等)
│       │   └── mock/                    # 模拟执行引擎 (simulatedEngine.ts)
│       ├── package.json
│       └── tsconfig.json
├── package.json                         # Monorepo 根 package.json
├── pnpm-workspace.yaml                  # pnpm 工作区配置
└── tsconfig.base.json                   # 全局基础 TypeScript 配置
```

---

## 2. 关键职责与实现证据

| 路径 | 职责 | 状态 | 证据 |
| :--- | :--- | :--- | :--- |
| `packages/protocol` | 领域实体、事件流、Capability 权限引擎、沙箱抽象与加权评分公式 | Implemented | Code-Verified (`packages/protocol/src/`) |
| `packages/tui` | 键盘优先的 React Ink 终端交互客户端原型 | Implemented | Code-Verified (`packages/tui/src/`) |
| `packages/core-daemon` | 核心调度守护进程、Session Checkpoint 持久化与 Context Manager | Specified | PRD/TechSpec v2.0 |
| `packages/sandbox` | 本地轻量进程沙箱与 Docker 隔离后端实现 | Specified | PRD/TechSpec v2.0 |
| `packages/eval-engine` | 硬性断言、变异体注入执行与综合打分引擎 | Specified | PRD/TechSpec v2.0 |
| `packages/web` | 基于 Web 的全景可观测性与治理看板控制台 | Specified | PRD/TechSpec v2.0 |

---

## 3. 依赖方向规则

```text
packages/tui (UI Layer)      packages/web (UI Layer)
         \                        /
          \                      /
           ↓                    ↓
          packages/core-daemon (Orchestration)
           /         |         \
          ↓          ↓          ↓
packages/sandbox  packages/eval-engine
          \          |          /
           \         |         /
            ↓        ↓        ↓
         packages/protocol (Pure Domain Contract)
```

1. `packages/protocol` 必须保持纯 TypeScript 类型与无外部副作用的纯逻辑（如评分计算、模式匹配），**绝对禁止依赖任何具体 UI 或 Node 专用环境实现**；
2. 上层 UI (`tui`, `web`) 与执行器仅通过 Protocol 定义的信封 (`ProtocolEnvelope`) 与事件流 (`AgentEvent`) 进行单向或双向通信；
3. 沙箱实现不得直接反向依赖编排守护服务。
