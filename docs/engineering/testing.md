# 测试与质量评估规范 (Testing & Evaluation Guide)

本文档定义 TestAgent Studio & Eval 平台自身的质量保证策略与面向 Coding Agent 的评测指标。

---

## 1. 平台自身自动化测试

| 测试类型 | 测试范围 | 关联命令 / 目录 | 状态 |
| :--- | :--- | :--- | :--- |
| **单元测试 (Unit Tests)** | Protocol 评分计算公式、Capability 权限通配符匹配 | `vitest run` / `packages/protocol/tests` | Implemented |
| **组件测试 (Component Tests)** | TUI 键盘快捷键监听、Tab 切换、模态框渲染 | `packages/tui` | Implemented |
| **集成测试 (Integration Tests)** | SQLite 数据持久化与 Checkpoint 回溯 | `packages/core-daemon` | Specified |
| **端到端测试 (E2E Tests)** | 模拟完整 Golden Loop 运行与断言 | Monorepo E2E Suite | Specified |

---

## 2. Coding Agent 评测标准矩阵 (Eval Metric Mapping)

| 评测维度 | 权重 | 评估依据 | 证据状态 |
| :--- | :--- | :--- | :--- |
| **Correctness (正确性)** | 40% | 硬性编译通过率 + 既有用例通过率 | Code-Verified (`scoring.ts`) |
| **Mutation Power (变异力)** | 25% | Stryker/Mutmut 注入变异体杀死率 ($Killed / Total$) | Code-Verified (`scoring.ts`) |
| **Scope Discipline (作用域)** | 15% | 修改是否限制在 `targetFiles` 白名单内 | Code-Verified (`scoring.ts`) |
| **Efficiency (资源效率)** | 10% | 达到测试目标所需的 Token 消耗与 Tool 交互轮次 | Code-Verified (`scoring.ts`) |
| **Stability (稳定性)** | 10% | 相同 Seed 与配置下多次执行的一致性率 | Code-Verified (`scoring.ts`) |
