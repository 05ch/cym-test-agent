# 系统架构全景 (Architecture Overview)

## 1. 目标架构 (Target Architecture)

TestAgent Studio & Eval 采用**分层解耦的松耦合架构**，由四层主要结构与双通道数据存储层构成：

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. 接入层 (API & Ingress Layer)                                        │
│   • Unix Domain Socket (TUI 本地 IPC, 0ms 网络开销)                      │
│   • WebSocket / HTTP RPC (Web Dashboard, 双向事件推送)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ 2. 编排层 (Orchestration Layer - Agent Runtime)                        │
│   • Session & Run Manager (会话生命周期与分叉调度)                       │
│   • Context Lifecycle Manager (分段构建、压缩、滑动窗口、缓存核算)        │
│   • Model Provider Adapter (能力协商、原生流解析、多模型协议转换)         │
│   • Eval Orchestrator (用例派发、变异注入、评分计算)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ↓ (Tool Request + Capability Check)
┌────────────────────────────────────────────────────────────────────────┐
│ 3. 执行层 (Execution Layer - Tool Runtime & Policy)                    │
│   • Policy & Capability Engine (细粒度权限校验、危险拦截)                │
│   • Skill Package Loader (加载 Manifest、Schema 验证)                  │
│   • Tool Adapters (AST 解析器、Git 操作器、Test Runner、文件操作)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ↓ (隔离执行指令)
┌────────────────────────────────────────────────────────────────────────┐
│ 4. 环境隔离层 (Sandbox Backend Layer)                                   │
│   • Local Restricted Sandbox (开发阶段轻量进程隔离)                     │
│   • Containerized Sandbox (Docker / Podman 容器隔离)                   │
│   • MicroVM Sandbox (Firecracker / gVisor 高安全性生产隔离)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ↓ (事件持久化 & 产物归档)
┌────────────────────────────────────────────────────────────────────────┐
│ 5. 数据平面 (Data Layer)                                               │
│   • SQLite WAL (Metadata, Runs, Events, Checkpoints, Metrics)          │
│   • File/Object Artifact Store (Patches, Stdout Logs, Repo Snapshots)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 当前实现状态 (Current Implementation)

当前代码库已验证完成基础契约与客户端交互原型：

* **`@testagent/protocol` (Code-Verified)**:
  * 领域实体：`EvalDataset`, `EvalCase`, `ReproductionBundle`, `CompositeScoreBreakdown`, `ExperimentRun`, `Session`, `SessionCheckpoint`, `Artifact`, `EvalAssertion`；
  * 事件流定义：`RUN_STARTED`, `CONTEXT_BUILT`, `CONTEXT_COMPACTED`, `TOOL_REQUESTED`, `TOOL_FINISHED`, `ASSERTION_EVALUATED`, `RUN_FINISHED` 等；
  * 权限策略引擎：`CapabilityPolicyEngine`（支持通配符、授权、撤销与断言校验）；
  * 模型适配与沙箱接口：`ModelProviderAdapter`, `SandboxBackend`；
  * 综合评分算法：`calculateCompositeScore`。
* **`@testagent/tui` (Code-Verified)**:
  * 基于 React Ink 的单窗口多 Tab 终端交互原型；
  * 键盘快捷键监听 (`1-5`, `d`, `t`, `Space`, `Ctrl+C`, `Ctrl+R`, `a`, `x`, `q`)；
  * 包含 `Header`, `TraceDAG`, `DiffViewer`, `StdoutLogViewer`, `ScoreCard`, `ApprovalModal`, `FooterBar` 组件；
  * 包含模拟事件流引擎 `simulatedEngine.ts`。

---

## 3. 架构差距分析 (Gaps & Roadmap)

| 目标能力 | 当前状态 | 差距分析与后续行动 |
| :--- | :--- | :--- |
| **Core Daemon (调度引擎)** | Specified | 需创建 `packages/core-daemon`，实现真实的 Session 状态机与 Unix Socket IPC 监听。 |
| **Context Lifecycle Manager** | Specified | Protocol 已定义 Segment 与 Cache 接口，需实现滑动窗口与自动优先级裁剪算法。 |
| **Model Adapters** | Specified | Protocol 已定义抽象接口，需实现 Anthropic、OpenAI 与 DeepSeek 适配器。 |
| **Sandbox Execution** | Specified | Protocol 已定义 `SandboxBackend` 接口，需实现 Local ChildProcess 与 Docker 后端。 |
| **Eval Engine** | Partial | 评分公式已实现，需接入真实 Vitest/Jest 执行与 Stryker 变异测试调度。 |
| **Web Dashboard** | Specified | 待后续在 P2 阶段构建 `@testagent/web`。 |
