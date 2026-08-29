# 核心业务规则 (Business Rules)

本文档记录 TestAgent Studio & Eval 平台跨模块、跨接口均必须严格遵守的核心业务规则与不变式。

---

## BR-SCORE-001 五维加权综合评分计算公式

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/scoring.ts:calculateCompositeScore`)
- **规则定义**:
  综合评分 $S_{\text{composite}}$ 取值范围为 $[0, 100]$，由 5 个子维度加权求和，各子项权重分配严格如下且总和必须等于 $1.00$：
  $$S_{\text{composite}} = 0.40 \cdot S_{\text{correctness}} + 0.25 \cdot S_{\text{mutation}} + 0.15 \cdot S_{\text{scope}} + 0.10 \cdot S_{\text{efficiency}} + 0.10 \cdot S_{\text{stability}}$$
- **子项说明**:
  1. `correctness` (40%): 硬性断言、TypeScript 编译通过与目标单测通过率；
  2. `mutationPower` (25%): 对抗变异体杀死率 ($Killed / Total$)；
  3. `scopeDiscipline` (15%): 是否严格限定在 `targetFiles` 允许范围内修改，无越界写；
  4. `efficiency` (10%): Token 消耗与 Tool 交互轮次相对基准的收敛程度；
  5. `stability` (10%): 相同种子与配置下多次重复运行结果的一致性。

---

## BR-CAP-001 最小权限原则与越权拦截

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/permissions.ts:assertCapability`)
- **规则定义**:
  1. 所有 Tool 调用在分发给沙箱执行前，必须首先经过 `CapabilityPolicyEngine` 校验；
  2. 未在已授权列表中的 Capability 必须立即拦截；
  3. 在交互模式（如 TUI/Web）下，拦截后进入 `WAITING_APPROVAL` 状态并弹出审批模态框；
  4. 若用户批准 (`a`) 则动态 Grant 并继续执行；若拒绝 (`x`) 则本步骤标记为 `failed` 并抛出 `[Security Violation] Capability Denied`。

---

## BR-CAP-002 Capability 模式匹配语法

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/permissions.ts:matchesCapability`)
- **规则定义**:
  - `*`: 匹配任意 Capability（最高特权模式）；
  - `/**`: 路径前缀递归匹配（例如 `fs.write:/workspace/src/**` 可匹配 `/workspace/src/utils/test.ts`）；
  - `:*`: 操作类型通配匹配（例如 `process.spawn:*` 匹配任意进程启动指令）；
  - 精确匹配：完全一致的字符串才视为匹配。

---

## BR-CTX-001 上下文分段优先级与动态裁剪策略

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/context.ts:ContextSegment`)
- **规则定义**:
  1. 上下文分段必须赋予生命周期与优先级（Priority: `0` 最高，`100` 最低）；
  2. `System` 与 `Skills` 属于 `durable`，Priority 为 0，**在任何上下文压缩策略下均不可被裁剪**；
  3. `RepoMap` 与 `ChatHistory` 属于 `working`，可进行语义摘要或滑动窗口折叠；
  4. `ToolResults` 与 `Scratchpad` 属于 `ephemeral`，Priority 较高（如 80-100），当 Token 逼近模型窗口上限时首先被清空或截断；
  5. 每次执行裁剪必须发出 `CONTEXT_COMPACTED` 事件记录裁剪前后的 Token 数量变化。

---

## BR-SANDBOX-001 沙箱执行环境单向隔离与快照一致性

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/sandbox.ts:SandboxBackend`)
- **规则定义**:
  1. 每个 `ExperimentRun` 或 `Session` 必须基于独立的 `repoSnapshotPath` 初始化沙箱；
  2. 沙箱内执行的文件修改、编译与测试产物不得影响宿主机文件系统；
  3. 执行补丁 (`applyPatch`) 必须先校验 SHA256 与文件范围；
  4. 支持轻量级快照创建 (`createCheckpoint`) 与还原 (`restoreCheckpoint`)。

---

## BR-SESSION-001 会话历史不可篡改与分叉继承

- **状态**: Implemented
- **证据**: Code-Verified (`packages/protocol/src/entities.ts:Session,SessionCheckpoint`)
- **规则定义**:
  1. 既有会话已完成的 Step 与 Checkpoint 为只读，不可在原序列中修改；
  2. 当用户选择从第 $N$ 步重试或调整 Prompt 时，必须创建新的分叉会话（`parentSessionId = sourceSession.id`, `forkedFromStep = N`）；
  3. 分叉会话复制 $0 \dots N$ 步的状态快照，并在新分支上继续推进。
