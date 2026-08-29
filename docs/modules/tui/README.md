# TUI 终端客户端设计 (`@testagent/tui`)

## 1. 模块定位与职责

`@testagent/tui` 是面向算法与研发工程师的键盘优先终端交互界面，基于 React Ink 构建。负责：
* 接收并渲染 Agent 执行事件流；
* 提供多 Tab 视图（Trace DAG、Git Diff 补丁、Terminal 日志、综合评分卡）；
* 拦截越权 Capability 请求并弹窗审批；
* 处理全局键盘快捷键与单步执行控制。

---

## 2. 源码入口索引

* [cli.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/cli.tsx) - 终端 App 入口与键盘状态机
* [components/Header.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/components/Header.tsx) - 状态、模型与 Token 统计头部
* [components/TraceDAG.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/components/TraceDAG.tsx) - 执行链路 DAG 可视化
* [components/DiffViewer.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/components/DiffViewer.tsx) - 补丁代码差异高亮
* [components/StdoutLogViewer.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/components/StdoutLogViewer.tsx) - 终端日志与虚拟滚动保护
* [components/ScoreCard.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/components/ScoreCard.tsx) - 五维加权得分展示
* [components/ApprovalModal.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/components/ApprovalModal.tsx) - 越权操作权限弹窗审批
* [components/FooterBar.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/components/FooterBar.tsx) - 底部状态与快捷键提示
* [mock/simulatedEngine.ts](file:///Users/chaix/project/cym-test-agent/packages/tui/src/mock/simulatedEngine.ts) - 模拟事件流与执行器
