# 组件设计与边界规范 (Architecture Components)

本文档定义 TestAgent Studio & Eval 系统中各个核心组件的职责、输入输出契约、依赖关系与扩展点。

---

## 1. 核心组件全景列表

| 组件名称 | 归属模块 | 核心职责 | 输入 | 输出 |
| :--- | :--- | :--- | :--- | :--- |
| **Ingress Server** | `core-daemon` | 监听 Unix Domain Socket / WebSocket，分发客户端请求与推送事件 | 客户端控制指令 (`ProtocolEnvelope`) | 实时事件流 (`AgentEvent`) |
| **Session Manager** | `core-daemon` | 管理 Agent 运行会话生命周期、分支与 Checkpoint 状态 | Run 请求、Fork 指令 | Session 状态、快照指针 |
| **Context Lifecycle Manager** | `core-daemon` | 分段组装上下文、计算 Token 预算、执行优先级裁剪与 Prompt 缓存核算 | 会话历史、工具结果、仓库索引 | 结构化 Context Segments、缓存收益指标 |
| **Capability Policy Engine** | `protocol` / `core-daemon` | 实施细粒度权限校验，拦截越权操作并触发人工审批 | Tool 请求与所需 Capability | 放行 / 拒绝 / 审批事件 |
| **Sandbox Runtime** | `sandbox` | 隔离执行 Agent 发起的代码读写、Patch 应用、测试命令执行 | `ExecRequest`, Patch 内容 | `ExecResult`, 产物文件 |
| **Eval Engine** | `eval-engine` | 运行测试断言、调度变异测试、计算五维加权得分 | 生成的单测补丁、EvalCase 规则 | `EvalAssertion`, `CompositeScoreBreakdown` |
| **TUI Client** | `tui` | 终端人机交互界面，展示 Trace DAG、Diff、日志并响应快捷键 | 键盘事件、服务端事件流 | 终端 UI 渲染、审批反馈 |

---

## 2. 组件依赖与通信约束

1. **单向依赖规则**：
   - `tui` / `web` $\rightarrow$ `core-daemon` $\rightarrow$ `sandbox` / `eval-engine` $\rightarrow$ `protocol`；
   - 严禁下层模块直接引用上层模块代码。
2. **沙箱边界**：
   - Agent 发起的任何文件修改与命令执行均必须通过 `SandboxBackend` 接口下发，**严禁 Agent 进程直接调用 Node.js `child_process` 或 `fs` 写入宿主机目录**。
3. **数据所有权**：
   - 结构化实体与运行指标数据由 `core-daemon` 统一写入 SQLite；
   - 产生的文件补丁、Stdout 大日志由 Artifact Store 管理，SQLite 仅保存其哈希引用与元数据。
