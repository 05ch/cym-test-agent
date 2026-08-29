# 测试 Agent 研发与质量评测平台 (TestAgent Studio & Eval)

> **知识库版本**: v2.0  
> **更新时间**: 2026-08-30  
> **核心使命**: 为针对代码编写与单测补充的 Coding/Testing Agent 提供**可复现、严谨量化、支持实验对比**的研发与评测基础设施。

---

## 1. 当前阶段与状态 (Current Stage)

- **当前里程碑**: v2.0 (P0 基线推进中)
- **已验证能力 (Code-Verified)**:
  - `@testagent/protocol`: 统一协议信封、领域实体模型、事件流、Capability 权限策略引擎、上下文分段、五维综合打分算法；
  - `@testagent/tui`: 键盘优先 React Ink 终端交互客户端原型（含 Trace DAG、Diff 查看、Stdout 虚拟滚动、评分卡与越权审批模态框）。
- **推进中能力 (Specified / InProgress)**:
  - `@testagent/core-daemon`: Unix Domain Socket 调度守护进程、Session 状态机与 Checkpoint 持久化；
  - `@testagent/sandbox`: 本地轻量子进程隔离与 Docker 容器沙箱实现；
  - `@testagent/eval-engine`: Stryker 变异测试接入与三层断言评估。

---

## 2. 核心架构全景 (System Blueprint)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. 接入层 (API & Ingress): Unix Domain Socket / WebSocket RPC          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ 2. 编排层 (Orchestration): Session Manager / Context Manager / Adapter │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ↓ (Tool Request + Capability Check)
┌────────────────────────────────────────────────────────────────────────┐
│ 3. 执行层 (Execution & Policy): Capability Policy Engine / Adapters    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ↓ (隔离执行指令)
┌────────────────────────────────────────────────────────────────────────┐
│ 4. 环境隔离层 (Sandbox Backend): Local Restricted / Docker / Firecracker│
└───────────────────────────────────┬────────────────────────────────────┘
                                    ↓ (事件持久化 & 产物归档)
┌────────────────────────────────────────────────────────────────────────┐
│ 5. 数据平面 (Data Layer): SQLite WAL + File/Object Artifact Store      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 结构化文档索引 (Knowledge Base Index)

### 📌 项目与业务定义 (Project & Requirements)
* [项目概述与目标 (Overview)](file:///Users/chaix/project/cym-test-agent/docs/project/overview.md) - 使命、用户角色、使用场景与产品范围
* [需求与验收标准 (Requirements)](file:///Users/chaix/project/cym-test-agent/docs/project/requirements.md) - REQ-BUILD-001 ~ REQ-TUI-001 稳定 ID 需求清单
* [核心业务规则 (Business Rules)](file:///Users/chaix/project/cym-test-agent/docs/project/business-rules.md) - BR-SCORE-001 ~ BR-SESSION-001 评分与安全规则
* [目录与结构规范 (Structure)](file:///Users/chaix/project/cym-test-agent/docs/project/structure.md) - Monorepo 目录结构与依赖方向
* [技术选型与配置 (Tech Stack)](file:///Users/chaix/project/cym-test-agent/docs/project/tech-stack.md) - 技术栈理由、边界与关键配置文件

### 🏛️ 架构与系统设计 (Architecture)
* [系统架构全景 (Architecture Overview)](file:///Users/chaix/project/cym-test-agent/docs/architecture/overview.md) - 目标架构、当前实现与差距分析
* [组件职责与边界 (Components)](file:///Users/chaix/project/cym-test-agent/docs/architecture/components.md) - 各层核心组件输入输出与隔离边界
* [数据流与调用链路 (Data Flow)](file:///Users/chaix/project/cym-test-agent/docs/architecture/data-flow.md) - 黄金闭环 Trace 与 Session 分叉调用流
* [部署与环境规范 (Deployment)](file:///Users/chaix/project/cym-test-agent/docs/architecture/deployment.md) - 运行形态、环境变量与沙箱安全配置

### 🔌 接口、契约与数据 (Contracts & Data)
* [接口与协议契约 (API Contracts)](file:///Users/chaix/project/cym-test-agent/docs/contracts/api.md) - ProtocolEnvelope 信封、握手与控制指令
* [校验与数据边界 (Validation)](file:///Users/chaix/project/cym-test-agent/docs/contracts/validation.md) - DTO Schema、评分与 Capability 校验规则
* [Agent 事件流规范 (Event Stream)](file:///Users/chaix/project/cym-test-agent/docs/contracts/events.md) - 11 种 AgentEventType 及其负载定义
* [数据库与存储设计 (Database)](file:///Users/chaix/project/cym-test-agent/docs/data/database.md) - SQLite DDL 关系表与 Artifact Store 结构

### 🛠️ 工程、前端与模块 (Engineering, Frontend & Modules)
* [开发与运行指南 (Development Guide)](file:///Users/chaix/project/cym-test-agent/docs/engineering/development-guide.md) - 环境准备、脚本、提交与维护规范
* [测试与评测规范 (Testing Guide)](file:///Users/chaix/project/cym-test-agent/docs/engineering/testing.md) - 平台自测与 Agent 评测矩阵映射
* [终端与交互设计 (Frontend & TUI)](file:///Users/chaix/project/cym-test-agent/docs/frontend/design-and-interaction.md) - 终端布局、Tab 视图与全局快捷键
* [Protocol 模块设计](file:///Users/chaix/project/cym-test-agent/docs/modules/protocol/README.md) - `@testagent/protocol` 契约核心
* [TUI 模块设计](file:///Users/chaix/project/cym-test-agent/docs/modules/tui/README.md) - `@testagent/tui` 终端客户端

### 📝 演进、变更与风险 (History & Risks)
* [结构化元数据索引 (index.json)](file:///Users/chaix/project/cym-test-agent/docs/index.json) - 机器可解析的索引映射
* [版本变更历史 (Changelog)](file:///Users/chaix/project/cym-test-agent/docs/changes/CHANGELOG.md) - 需求与架构演进记录
* [技术债与演进风险 (Technical Debt)](file:///Users/chaix/project/cym-test-agent/docs/risks/technical-debt.md) - 已知技术债务与缓解策略

### 📑 原始规范归档 (Legacy Specs)
* [产品需求文档 (PRD v2.0)](file:///Users/chaix/project/cym-test-agent/docs/01-prd-product-requirements.md)
* [技术架构与选型规范 (Tech Spec v2.0)](file:///Users/chaix/project/cym-test-agent/docs/02-tech-spec-architecture.md)
* [研发路线图与优先级 (Roadmap)](file:///Users/chaix/project/cym-test-agent/docs/03-roadmap-priorities.md)
* [完整规范合集 (Full Spec)](file:///Users/chaix/project/cym-test-agent/docs/TEST_AGENT_STUDIO_EVAL_V2.md)

---

## 4. 关键源码入口 (Source Code Map)

| 模块 / 子包 | 关键入口 | 职责说明 |
| :--- | :--- | :--- |
| **`@testagent/protocol`** | [index.ts](file:///Users/chaix/project/cym-test-agent/packages/protocol/src/index.ts) | 导出所有实体、信封、事件流、Capability 权限与评分算法 |
| **`@testagent/tui`** | [cli.tsx](file:///Users/chaix/project/cym-test-agent/packages/tui/src/cli.tsx) | 键盘优先 React Ink 终端交互 App 入口 |
