# 数据流与调用链路 (Architecture Data Flow)

本文档描述 TestAgent Studio & Eval 在核心工作流中的端到端真实调用链。

---

## 1. 黄金质量闭环执行调用流 (The Golden Loop Trace)

```text
TUI / Web Client
  │ 1. 触发 Run (EvalCaseId: "payment-core-eval")
  ▼
Core Daemon::SessionManager
  │ 2. 创建 Session & RunRecord (status: "running")
  │ 3. 发出 RUN_STARTED 事件
  ▼
ContextLifecycleManager
  │ 4. 组装 System + Skills + RepoMap + Prompt
  │ 5. 发出 CONTEXT_BUILT (包含 Token 预算与 Cache 指标)
  ▼
ModelProviderAdapter (e.g. Claude 3.7 Sonnet)
  │ 6. 发起流式推理请求
  │ 7. 推送 REASONING_SUMMARY_CHUNK (思考流)
  │ 8. 返回 TOOL_REQUESTED (tool: "sandbox_exec", cmd: "vitest")
  ▼
CapabilityPolicyEngine
  │ 9. 校验 Capability ("process.spawn:test-runner")
  ├── [未授权] ──► 推送 WAITING_APPROVAL ──► TUI 弹出 ApprovalModal ──► 用户按 'a' 授权
  └── [已授权] ──► 放行指令
  ▼
SandboxBackend (Local / Docker)
  │ 10. 执行测试/应用补丁
  │ 11. 产生 ExecResult (exitCode, stdout, durationMs)
  │ 12. 归档 Artifact (patch/stdout) ──► Artifact Store
  ▼
EvalEngine (Scorer & Mutation)
  │ 13. 硬性断言检查 (Compile, Test Pass)
  │ 14. 变异体注入与杀死率计算 (Mutants Killed / Total)
  │ 15. calculateCompositeScore() 计算综合得分
  │ 16. 发出 ASSERTION_EVALUATED & RUN_FINISHED 事件
  ▼
SQLite Database & TUI Client
  │ 17. 持久化 Run 结果与分数
  │ 18. TUI 更新 Trace DAG、Diff、Stdout 与 ScoreCard
```

---

## 2. 上下文分叉重试调用流 (Session Fork & Time-Travel Flow)

```text
TUI Client (User hits 'Ctrl+R' or selects Step N)
  │ 1. 发起 ForkSessionRequest(sourceSessionId, stepIndex: N)
  ▼
Core Daemon::SessionManager
  │ 2. 读取 SQLite 中 Step N 的 SessionCheckpoint 快照
  │ 3. 创建新的 Session(parentSessionId: sourceSessionId, forkedFromStep: N)
  ▼
SandboxBackend
  │ 4. 调用 restoreCheckpoint(checkpointId) 回滚文件与环境快照
  ▼
ContextLifecycleManager
  │ 5. 重构第 N 步的上下文环境
  ▼
Core Daemon
  │ 6. 重新进入 RUNNING 状态并在新会话分支上继续单步推进
```
