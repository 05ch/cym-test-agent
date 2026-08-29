# 技术选型与规范 (Tech Stack & Rationale)

本文档记录 TestAgent Studio & Eval 平台的技术选型、决策依据与关键配置边界。

---

## 1. 核心语言与包管理

| 技术/工具 | 版本/范围 | 选型用途 | 选型理由与边界 |
| :--- | :--- | :--- | :--- |
| **TypeScript** | `^5.7.3` | 全栈开发语言 | 强类型契约、跨包类型共享、完备的 AST 解析与类型安全保障。 |
| **Node.js** | `>=20.x` (LTS) | 运行时环境 | 稳定支持原生 ESM、内置 fetch、成熟的 Child Process 与 IPC 生态。 |
| **pnpm Workspace** | `^11.21.0` | Monorepo 包管理器 | 极速硬链接安装、严格的 `node_modules` 依赖隔离，杜绝幽灵依赖。 |

---

## 2. 交互与展示层 (Frontend / UI)

| 组件/框架 | 选型理由 | 约束与边界 |
| :--- | :--- | :--- |
| **React Ink (`ink`)** | 借助 React 组件化范式构建现代化富文本终端 TUI | 严控渲染重绘频率，终端虚拟滚动保护，规避长文本刷屏导致假死。 |
| **Vanilla CSS / Modern Web (规划)** | 极简高效、零构建开销、极致可控的深色主题与仪表盘 | 仅在 Web 控制台使用，遵循现代语义化 HTML5 与现代 CSS 变量规范。 |

---

## 3. 编排、数据与执行层 (Runtime & Storage)

| 技术选型 | 选型用途 | 关键边界与配置 |
| :--- | :--- | :--- |
| **SQLite (WAL Mode)** | 运行元数据、事件流与 Checkpoint 存储 | 单文件无网络依赖，极低写入开销，满足高频事件记录。 |
| **Local File / Object Store** | 补丁代码、Terminal Stdout、仓库快照 | 大体积产物哈希去重 (`sha256Hash`)，杜绝大文本撑爆数据库。 |
| **Docker / Podman Engine** | 测试代码沙箱隔离执行 | 严格挂载只读卷与限制 CPU/内存/网络出口，防止逃逸。 |
| **Stryker / Mutmut** | 自动化变异测试工具 | 自动化注入代码变异，客观量化生成单测的缺陷捕获能力。 |

---

## 4. 关键配置文件索引

* `package.json`: 根工作区构建脚本与全局 devDependencies；
* `pnpm-workspace.yaml`: 工作区包路径匹配 (`packages/*`)；
* `tsconfig.base.json`: 基础 TypeScript 编译配置 (`target: ES2022`, `module: NodeNext`)；
* `packages/protocol/tsconfig.json`: Protocol 纯类型与 NodeNext 编译配置；
* `packages/tui/tsconfig.json`: TUI JSX/TSX 编译配置。
