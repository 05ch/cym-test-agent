# Protocol 模块设计与契约 (`@testagent/protocol`)

## 1. 模块定位与职责

`@testagent/protocol` 是 TestAgent Studio & Eval 跨进程、跨子包通信的基础契约核心，提供：
* 实体接口：`EvalDataset`, `EvalCase`, `ReproductionBundle`, `CompositeScoreBreakdown`, `ExperimentRun`, `Session`, `SessionCheckpoint`, `Artifact`, `EvalAssertion`；
* 协议信封与握手：`ProtocolEnvelope`, `HandshakeRequest`, `HandshakeResponse`；
* 事件流定义：`AgentEvent`, `AgentEventType`；
* 权限策略引擎：`CapabilityPolicyEngine`；
* 上下文与缓存：`ContextSegment`, `CacheMetrics`；
* 模型与沙箱适配接口：`ModelProviderAdapter`, `SandboxBackend`；
* 评分计算公式：`calculateCompositeScore`。

---

## 2. 源码入口索引

* [index.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/index.ts) - 统一对外导出入口
* [entities.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/entities.ts) - 领域实体定义
* [envelope.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/envelope.ts) - 信封与握手协议
* [events.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/events.ts) - Agent 事件流
* [permissions.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/permissions.ts) - 权限策略引擎
* [context.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/context.ts) - 上下文分段模型
* [provider.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/provider.ts) - 模型适配器抽象
* [sandbox.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/sandbox.ts) - 沙箱后端接口
* [scoring.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/scoring.ts) - 五维加权综合评分实现
