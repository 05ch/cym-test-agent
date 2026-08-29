# 项目需求定义 (Requirements)

本文档维护 TestAgent Studio & Eval 当前有效的产品与功能需求。所有需求均具备唯一且稳定的 ID。

---

## REQ-BUILD-001 基准评测集与用例制作 (Benchmark Dataset & Eval Case)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/entities.ts:EvalDataset,EvalCase`)
- **目标**: 支持定义不可变的 Benchmark Dataset 和单条 Eval Case，包含代码仓库 Git Commit SHA、目标修改文件边界、任务提示词与工程约束。
- **范围**:
  - `EvalDataset` 元数据管理与版本控制；
  - `EvalCase` 包含 `repoCommitSha`、`targetFiles`、`taskPrompt`、`constraints`；
  - 导出与共享可复现数据集定义。
- **验收标准**:
  - [x] Protocol 中完成 `EvalDataset` 与 `EvalCase` 类型定义；
  - [ ] Core Daemon 支持从 JSON / DB 加载并实例化 EvalCase。
- **关联模块**: `protocol`, `core-daemon`
- **最近更新**: 2026-08-30

---

## REQ-RUN-001 会话生命周期与分叉调度 (Session Lifecycle & Forking)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/entities.ts:Session,SessionCheckpoint`)
- **目标**: 支持 Agent 运行会话管理、按 Step 保存 Checkpoint，并支持从任意历史 Checkpoint 产生分叉会话（Forked Session）进行调试。
- **范围**:
  - `Session` 包含 `id`, `runId`, `parentSessionId`, `forkedFromStep`；
  - `SessionCheckpoint` 记录分步状态快照指针；
  - 支持会话暂停、重试与分叉执行。
- **验收标准**:
  - [x] Protocol 中完成 `Session` 与 `SessionCheckpoint` 类型定义；
  - [x] TUI 支持通过快捷键与模拟器触发重试与暂停；
  - [ ] Core Daemon 完成 Checkpoint 快照持久化逻辑。
- **关联模块**: `protocol`, `core-daemon`, `tui`
- **最近更新**: 2026-08-30

---

## REQ-RUN-002 上下文分段管理与缓存核算 (Context Segmentation & Cache Accounting)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/context.ts`, `packages/protocol/src/events.ts:CONTEXT_BUILT,CONTEXT_COMPACTED`)
- **目标**: 将 Agent 输入上下文划分为生命周期不同的分段（System、Skills、RepoMap、ChatHistory、ToolResults、Scratchpad），支持按优先级动态裁剪和精细化 Token 缓存收益核算。
- **范围**:
  - 划分 `durable`, `working`, `ephemeral` 三级生命周期；
  - 为每个 Segment 标记 `priority` (0-100) 与 `cacheable` 属性；
  - 输出 `CacheMetrics` (输入 Token、命中读取、写入与估算节省成本)。
- **验收标准**:
  - [x] Protocol 中定义 `ContextSegment` 与 `CacheMetrics`；
  - [x] Protocol 事件流支持 `CONTEXT_BUILT` 与 `CONTEXT_COMPACTED`；
  - [ ] Context Lifecycle Manager 实现基于 Token 预算的自动滑动窗口与压缩算法。
- **关联模块**: `protocol`, `core-daemon`
- **最近更新**: 2026-08-30

---

## REQ-RUN-003 模型供应商统一抽象 (Model Provider Adapter)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/provider.ts`)
- **目标**: 提供统一的 Model Provider 适配层，屏蔽 Claude、GPT、DeepSeek 等不同模型的原生 API 差异，提供能力协商与流式事件转换。
- **范围**:
  - `ModelCapabilities` 能力特征声明（原生 ToolCall、并行执行、思考摘要、Prompt 缓存策略、最大窗口等）；
  - `ModelProviderAdapter` 统一流式输出 `AsyncIterable<AgentEvent>`。
- **验收标准**:
  - [x] Protocol 中定义 `ModelCapabilities` 与 `ModelProviderAdapter`；
  - [ ] 实现 Anthropic、OpenAI、DeepSeek 适配器。
- **关联模块**: `protocol`, `core-daemon`
- **最近更新**: 2026-08-30

---

## REQ-EVAL-001 三层断言评测机制 (Three-Tier Assertion Layer)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/entities.ts:EvalAssertion`, `packages/protocol/src/events.ts:ASSERTION_EVALUATED`)
- **目标**: 建立分层评估体系，涵盖硬性断言 (编译与单测)、行为断言 (变异覆盖) 与效率断言 (Token 开销与调用轮次)。
- **范围**:
  - `hard`: 补丁应用成功、TypeScript 编译通过、测试用例无语法错误；
  - `behavioral`: 变异体存活/杀死状态、断言质量校验；
  - `efficiency`: 调用轮次与上下文预算合规性。
- **验收标准**:
  - [x] Protocol 中定义 `EvalAssertion` 实体与事件；
  - [ ] Eval Engine 实现自动化断言检查器。
- **关联模块**: `protocol`, `eval-engine`
- **最近更新**: 2026-08-30

---

## REQ-EVAL-002 五维加权综合评分计算 (Composite Scoring)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/scoring.ts`)
- **目标**: 依据严格公式计算 0-100 分的综合评测得分：`0.40 * 正确性 + 0.25 * 变异力 + 0.15 * 作用域纪律 + 0.10 * 效率 + 0.10 * 稳定性`。
- **范围**:
  - 实现标准 `calculateCompositeScore` 算法；
  - 输出 `CompositeScoreBreakdown` 各项分值明细；
  - 关联至 `ExperimentRun`。
- **验收标准**:
  - [x] Protocol 中实现并导出 `calculateCompositeScore` 函数与接口；
  - [x] 评分算法权重总和严格等于 1.00；
  - [x] TUI 渲染 ScoreCard 评分卡片。
- **关联模块**: `protocol`, `tui`, `eval-engine`
- **最近更新**: 2026-08-30

---

## REQ-GOVERN-001 基于 Capability 的权限安全沙箱 (Capability Policy Engine)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/permissions.ts`, `packages/protocol/src/sandbox.ts`)
- **目标**: 实施最小权限安全防护，工具调用必须持有匹配的 Capability（如 `fs.read`, `process.spawn`），越权操作即刻拦截或请求人工授权。
- **范围**:
  - Capability 语法定义（支持通配符模式 `*`, `/**`, `:*`）；
  - `CapabilityPolicyEngine` 权限授权与校验；
  - `SandboxBackend` 接口定义（Local, Docker, Firecracker）。
- **验收标准**:
  - [x] Protocol 中实现 `CapabilityPolicyEngine` 与 `SandboxBackend` 接口；
  - [x] TUI 提供 `ApprovalModal` 支持审批 `a` / 拒绝 `x` 越权请求；
  - [ ] 实现 Local 进程沙箱与 Docker 容器隔离后端。
- **关联模块**: `protocol`, `sandbox`, `tui`
- **最近更新**: 2026-08-30

---

## REQ-GOVERN-002 100% 可复现产物包 (Reproduction Bundle)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/entities.ts:ReproductionBundle,Artifact`)
- **目标**: 记录完整的环境与参数包（Git SHA、Worktree Diff、Prompt、ModelConfig、Seed、Skill/Tool 版本、沙箱后端、上下文策略），支持一键无缝复现实验。
- **范围**:
  - `ReproductionBundle` 实体定义；
  - 产物归档 `Artifact`（Patch, Stdout, Coverage, Snapshot），包含 SHA256 哈希。
- **验收标准**:
  - [x] Protocol 中定义 `ReproductionBundle` 与 `Artifact`；
  - [ ] Core Daemon 支持生成并持久化可复现产物包。
- **关联模块**: `protocol`, `core-daemon`
- **最近更新**: 2026-08-30

---

## REQ-TUI-001 键盘优先高响应终端交互客户端 (Keyboard-First TUI Client)

- **状态**: Implemented
- **证据**: Code-Verified (`packages/tui/src/cli.tsx`)
- **目标**: 基于 React Ink 构建现代化、极低延迟的 TUI 控制台，支持 Trace DAG、Git Diff 查看、Stdout 虚拟滚动、评分卡与权限审批。
- **范围**:
  - 5 大视图 Tab 切换（1: Trace DAG, 2: Diff, 3: Stdout, 4: Score, 5: Shortcuts）；
  - 快捷键支持（`q` 退出, `d` 切换 Diff, `t` 切换日志, `Ctrl+C` 暂停, `Ctrl+R` 重试, `Space` 单步/播放, `a`/`x` 审批）；
  - 实时 Token 消耗与状态流展示。
- **验收标准**:
  - [x] `@testagent/tui` 完整实现 Ink 渲染组件与交互控制器；
  - [x] 通过模拟引擎支持完整的 Step 状态与越权审批交互。
- **关联模块**: `tui`, `protocol`
- **最近更新**: 2026-08-30
