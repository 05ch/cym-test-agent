# 接口与协议契约 (API & Protocol Contracts)

本文档定义客户端（TUI / Web）与服务端（Core Daemon）之间的通信信封与核心 API 契约。

---

## 1. 统一协议信封 (Protocol Envelope)

所有请求与事件均被包装在标准信封内传输：

```typescript
export interface ProtocolEnvelope<T = any> {
  protocolVersion: number; // 协商版本号 (当前基线: 2)
  traceId: string;         // 分布式链路追踪 ID
  eventId: string;         // 唯一事件/请求 ID
  timestamp: number;       // 发送毫秒时间戳
  sessionId?: string;      // 关联会话 ID
  runId?: string;          // 关联运行记录 ID
  type: string;            // 消息类型
  payload: T;              // 负载数据
}
```

---

## 2. 握手与能力协商契约 (Handshake Contract)

### 请求: `HANDSHAKE_REQUEST`
```typescript
export interface HandshakeRequest {
  clientType: 'tui' | 'web';
  clientVersion: string;
  supportedProtocols: number[];
}
```

### 响应: `HANDSHAKE_RESPONSE`
```typescript
export interface HandshakeResponse {
  acceptedProtocol: number;
  daemonVersion: string;
  capabilities: {
    sandboxes: string[];  // e.g. ["local", "docker"]
    models: string[];     // e.g. ["claude-3-7-sonnet", "gpt-4o", "deepseek-v3"]
  };
}
```

---

## 3. 会话与运行控制接口 (Control Operations)

| 操作类型 (Type) | 方向 | 说明 | Payload 结构 |
| :--- | :--- | :--- | :--- |
| `RUN_CREATE` | 客户端 $\rightarrow$ 服务端 | 启动新的评测运行 | `{ evalCaseId: string; config?: Record<string, any> }` |
| `SESSION_PAUSE` | 客户端 $\rightarrow$ 服务端 | 暂停当前会话执行 | `{ sessionId: string }` |
| `SESSION_RESUME` | 客户端 $\rightarrow$ 服务端 | 恢复执行已暂停的会话 | `{ sessionId: string }` |
| `SESSION_FORK` | 客户端 $\rightarrow$ 服务端 | 从指定 Step Checkpoint 进行分叉重试 | `{ sourceSessionId: string; stepIndex: number }` |
| `CAPABILITY_APPROVE` | 客户端 $\rightarrow$ 服务端 | 批准越权操作 | `{ requiredCapability: string }` |
| `CAPABILITY_REJECT` | 客户端 $\rightarrow$ 服务端 | 拒绝越权操作 | `{ requiredCapability: string; reason?: string }` |
