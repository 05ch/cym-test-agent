# 工程开发与运行指南 (Development Guide)

本文档记录 TestAgent Studio & Eval 项目的本地开发、构建、运行与维护规范。

---

## 1. 环境准备与依赖安装

* **Node.js**: `>= 20.x` (推荐使用 LTS 版本)
* **pnpm**: `^11.21.0`
* **Docker** (可选): 当启用容器化沙箱时需本地运行 Docker Daemon。

### 安装命令
```bash
# 在项目根目录下执行安装
pnpm install
```

---

## 2. 常用开发与构建脚本

| 命令 | 作用 |
| :--- | :--- |
| `pnpm run build` | 递归全量编译 Monorepo 下的所有子包 (`protocol`, `tui`) |
| `pnpm run dev:tui` | 以开发模式启动 `@testagent/tui` 终端交互客户端 |
| `pnpm run build:tui` | 构建 `@testagent/tui` 产物 |
| `pnpm --filter @testagent/protocol run build` | 单独构建 `@testagent/protocol` 基础包 |

---

## 3. 分支与代码提交规范

* **分支命名**:
  * 功能开发: `feat/<domain>-<description>` (如 `feat/protocol-context-cache`)
  * 缺陷修复: `fix/<issue-key>`
  * 重构与优化: `refactor/<module>`
* **提交信息格式 (Conventional Commits)**:
  ```text
  feat(protocol): add ContextSegment and CacheMetrics interfaces
  fix(tui): resolve keyboard navigation index out of bounds
  docs(context): bootstrap standardized reference docs
  ```

---

## 4. 文档维护与同步要求

1. **增量优先**: 代码或需求变更后，使用 `cym-context` 进行增量同步，不覆盖无修改章节；
2. **协议先行**: 在修改上层业务或 UI 前，必须先在 `packages/protocol` 中完成类型与事件定义；
3. **保持 Harness 分离**: 不得在开发指南中书写 Agent 私有推理指令或修改根目录规约。
