# 变更历史 (Changelog)

本文档记录 TestAgent Studio & Eval 知识库与核心需求、架构及功能演进历史。

---

## 2026-08-30

### Added
- **标准化知识库构建 (Bootstrap cym-context)**: 完成在 `docs/` 下建立符合 `cym-context` 规约的高密度项目知识库。
- **协议与契约层交付 (`@testagent/protocol`)**:
  - 核心领域实体 (`EvalDataset`, `EvalCase`, `ReproductionBundle`, `CompositeScoreBreakdown`, `Session`, `SessionCheckpoint`, `Artifact`, `EvalAssertion`)；
  - 统一协议信封 (`ProtocolEnvelope`) 与握手协议；
  - Agent 事件流 (`AgentEvent`, `AgentEventType`)；
  - 细粒度权限控制 (`CapabilityPolicyEngine`) 与沙箱抽象 (`SandboxBackend`)；
  - 上下文分段模型与缓存收益指标 (`ContextSegment`, `CacheMetrics`)；
  - 五维加权综合评分公式算法 (`calculateCompositeScore`)。
- **终端交互客户端交付 (`@testagent/tui`)**:
  - React Ink 键盘优先 TUI 控制台 (`cli.tsx`)；
  - 多 Tab 视图（Trace DAG、Diff、Stdout、ScoreCard、Shortcuts）；
  - 权限拦截与人工审批模态框 (`ApprovalModal`)。
