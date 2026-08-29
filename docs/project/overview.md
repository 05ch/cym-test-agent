# 项目概述 (Project Overview)

## 1. 项目目标 (Project Mission & Vision)

**TestAgent Studio & Eval** (测试 Agent 研发与质量评测平台) 是专为针对代码编写与单测补充的 Coding/Testing Agent 打造的**可复现、严谨量化、支持实验对比的研发与评测基础设施**。

平台聚焦于解决 Coding/Testing Agent 研发与评估中的核心痛点：
* **难以复现**：环境状态漂移、随机种子未固定、外部依赖不可控；
* **单维评估片面**：仅看单测通过率容易引入作弊/低质断言（如空断言、无意义测试用例）；
* **缺乏细粒度可观测**：缺少 Token 消耗精细归因、推理与工具调用 DAG 追溯、沙箱拦截记录；
* **缺乏对抗评估能力**：无法客观衡量生成测试对业务代码缺陷的捕获能力（变异杀死率）。

---

## 2. 用户角色 (User Personas)

| 角色 | 目标与诉求 | 主要使用场景 |
| :--- | :--- | :--- |
| **Agent 算法/研发工程师 (Agent R&D Engineer)** | 调试 Prompt 策略、优化上下文构建窗口、验证模型适配能力 | 在 TUI/Web 中运行单步调试、查看 Trace DAG、回溯上下文缓存命中率 |
| **质量与评测专家 (Quality & Benchmark Specialist)** | 构建高质量基准评测集、设计对抗变异用例、监控模型能力回归 | 批量触发 Eval Matrix 评测矩阵、比对多模型综合质量评分 |
| **平台工程与运维 (Platform/DevOps Engineer)** | 确保沙箱隔离安全性、管理计算资源开销与 Token 预算 | 配置 Capability 权限规则、沙箱隔离后端 (Local/Docker/Firecracker) |

---

## 3. 使用场景 (Core Use Cases)

1. **黄金质量闭环评测 (The Golden Loop Evaluation)**：
   * 自动调度 Coding Agent 读取目标源码仓库，生成补充测试用例；
   * 在隔离沙箱中执行补丁、执行测试、进行故障归因与变异测试 (Mutation Testing)；
   * 输出五维综合评分（正确性 40%、变异力 25%、作用域 15%、效率 10%、稳定性 10%）。
2. **多模型/策略横向对比 (Experiment Matrix Comparison)**：
   * 在统一 Benchmark 数据集上，并行评测多模型（如 Claude 3.7 Sonnet、GPT-4o、DeepSeek-V3 等）和不同 Context 策略的表现。
3. **交互式会话回溯与分叉调试 (Interactive Session Forking & Time-Travel)**：
   * 在 TUI 终端中实时观察 Agent 思考流与工具执行；
   * 从任意 Checkpoint 节点进行上下文分叉 (Fork Session) 快速重试。

---

## 4. 产品范围与边界 (Scope & Non-Goals)

### Scope (In-Scope)
* **BUILD 域**：Eval Case 制作、仓库快照固化、基准集版本管理；
* **RUN 域**：Session 生命周期调度、分叉调试、分段上下文管理与缓存核算、Model Provider 统一适配；
* **EVALUATE 域**：三层断言系统 (硬性/行为/效率)、Stryker/Mutmut 变异测试接入、加权综合评分计算；
* **GOVERN 域**：基于 Capability 模式的最小权限控制引擎、可复现产物包 (Reproduction Bundle) 归档；
* **交互界面**：键盘优先、低延迟的 TUI 客户端 (`@testagent/tui`) 与 Web 观测控制台 (`@testagent/web`)。

### Non-Goals (Out-of-Scope)
* 不开发通用聊天机器人或通用办公自动化 Agent；
* 不作为生产代码部署上线系统；
* 不替代开发者编写业务逻辑源码，专精于测试/代码 Agent 自身的研发与评测。

---

## 5. 当前阶段与 MVP (Current Milestone)

- **当前版本**：v2.0 (Active Baseline)
- **阶段目标**：
  * 完成 Monorepo 架构与 `@testagent/protocol` 协议核心定义 (**Code-Verified**)；
  * 完成 `@testagent/tui` 终端交互原型与模拟执行流 (**Code-Verified**)；
  * 推进 Core Daemon 编排服务、Local/Docker Sandbox 后端以及 Eval Engine 评分引擎的具体实现 (**Specified / InProgress**)。
