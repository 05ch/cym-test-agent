# 技术债与已知风险 (Technical Debt & Risks)

本文档记录 TestAgent Studio & Eval 当前已确认的技术债务、限制与演进风险。

---

## 1. 当前已识别技术债务

| 编号 | 问题描述 | 影响模块 | 严重度 | 缓解策略 |
| :--- | :--- | :--- | :--- | :--- |
| **DEBT-001** | `packages/tui` 当前依赖 `mock/simulatedEngine.ts` 模拟流，未接入真实 IPC Socket | `tui` | Medium | 待 `packages/core-daemon` 实现 Unix Domain Socket 接入后切为真实事件流。 |
| **DEBT-002** | `packages/protocol` 中 `ModelProviderAdapter.generateStream` 尚未完成 Anthropic/OpenAI 原生 SDK 封装 | `protocol`, `core-daemon` | Medium | 在 `core-daemon` 中实现具体的 Adapter 实例。 |
| **DEBT-003** | 缺乏跨平台沙箱实现，当前仅有 `SandboxBackend` 接口定义 | `sandbox` | High | 优先交付轻量级本地子进程沙箱，随后推进 Docker 容器沙箱。 |

---

## 2. 演进风险与边界

1. **变异测试耗时风险**：大规模代码库运行 Stryker 耗时较长，后续需引入 AST 级测试影响分析 (TIA, Test Impact Analysis) 进行精准变异注入；
2. **终端大文本刷屏风险**：大体积测试输出可能引起终端重绘卡顿，TUI 必须严格执行虚拟滚动与行数截断（最大展示最近 200 行）。
