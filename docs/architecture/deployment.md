# 部署与环境配置规范 (Architecture Deployment)

本文档记录 TestAgent Studio & Eval 的运行环境、部署模式与基础设施配置。

---

## 1. 运行部署形态

| 部署形态 | 适用环境 | 核心组件构成 | 通信机制 |
| :--- | :--- | :--- | :--- |
| **本地开发者工作站 (Local Dev Mode)** | 本地 macOS / Linux 开发调试 | • `@testagent/tui` 客户端<br>• `@testagent/core-daemon` 本地进程<br>• Local ChildProcess 沙箱 | Unix Domain Socket (`/tmp/testagent.sock`) |
| **容器化评估集群 (Cluster Eval Mode)** | CI/CD 流水线、批量 Benchmark 评测 | • Web Dashboard (`@testagent/web`)<br>• Daemon 服务集群<br>• Docker / Podman 沙箱池 | WebSocket / HTTP RPC |

---

## 2. 核心环境变量配置规范

> [!IMPORTANT]
> 严禁在代码与文档中硬编码生产 API Key 或私钥。所有敏感凭证通过安全环境变量注入。

| 环境变量名 | 类型 | 说明 | 默认值 / 示例 |
| :--- | :--- | :--- | :--- |
| `TESTAGENT_DAEMON_SOCKET` | String | Unix Domain Socket 路径 | `/tmp/testagent.sock` |
| `TESTAGENT_DB_PATH` | String | SQLite 数据库文件存储路径 | `~/.testagent/data/state.db` |
| `TESTAGENT_ARTIFACTS_DIR` | String | 大文件产物存储目录 | `~/.testagent/artifacts` |
| `ANTHROPIC_API_KEY` | Secret | Claude 模型 API 调用凭证 | - |
| `OPENAI_API_KEY` | Secret | GPT 模型 API 调用凭证 | - |
| `DEEPSEEK_API_KEY` | Secret | DeepSeek 模型 API 调用凭证 | - |
| `TESTAGENT_SANDBOX_BACKEND`| Enum | 沙箱隔离后端 (`local` / `docker`) | `local` |
| `TESTAGENT_LOG_LEVEL` | Enum | 日志输出级别 (`debug`/`info`/`warn`) | `info` |

---

## 3. 沙箱环境安全配置建议

1. **资源限制 (Resource Limits)**：
   - Docker 容器隔离必须限制 CPU 配额（如 2 Core）与内存上限（如 4GB）；
   - 执行测试设置硬性超时阈值（如 `timeoutMs: 30000`），杜绝死循环挂死宿主机。
2. **网络出网控制 (Egress Control)**：
   - 评测执行阶段建议关闭沙箱外部公网访问权限，防止数据泄露或外部不可控请求。
