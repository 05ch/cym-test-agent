# Agent 事件流规范 (Agent Event Stream)

本文档定义 Agent 运行期间向上层客户端（TUI / Web）广播的流式事件类型与负载规范。

---

## 1. 事件类型概览 (`AgentEventType`)

| 事件类型 (`type`) | 触发时机 | 关键负载参数 (`payload`) |
| :--- | :--- | :--- |
| `RUN_STARTED` | 评测 Run 开始执行 | `{ runId, evalCaseId, config }` |
| `CONTEXT_BUILT` | Agent 上下文完成分段组装 | `{ segments: ContextSegmentMetric[], totalTokens, cacheStats }` |
| `CONTEXT_COMPACTED` | 触发滑动窗口或优先级裁剪 | `{ beforeTokens, afterTokens, prunedSegmentTypes }` |
| `MODEL_REQUEST_STARTED`| 发起大模型推理请求 | `{ stepIndex, model, promptTokens }` |
| `REASONING_SUMMARY_CHUNK`| 模型流式输出思考/推理摘要 | `{ textDelta }` |
| `TOOL_REQUESTED` | Agent 请求调用特定工具 | `{ toolName, args, requiredCapabilities }` |
| `TOOL_STARTED` | 工具通过鉴权并在沙箱中启动 | `{ toolName, executionId }` |
| `TOOL_FINISHED` | 工具执行结束 | `{ toolName, executionId, durationMs, status: 'ok'\|'error', stdoutRef, result }` |
| `ARTIFACT_CREATED` | 生成产物文件（补丁、大日志）| `{ artifactId, type, sha256, path, sizeBytes }` |
| `ASSERTION_EVALUATED` | 断言规则完成评估 | `{ layer: 'hard'\|'behavioral'\|'efficiency', rule, passed, score, details }` |
| `RUN_FINISHED` | 评测完成并产出最终综合分 | `{ runId, finalScore, status: 'passed'\|'failed', durationMs, error }` |

---

## 2. 核心事件 Payload 结构示例

### `CONTEXT_BUILT`
```typescript
{
  type: 'CONTEXT_BUILT',
  payload: {
    segments: [
      { id: 'seg-sys', type: 'system', tokenCount: 450, cacheable: true, priority: 0 },
      { id: 'seg-skill', type: 'skills', tokenCount: 680, cacheable: true, priority: 0 },
      { id: 'seg-repo', type: 'repo_map', tokenCount: 820, cacheable: false, priority: 20 },
      { id: 'seg-prompt', type: 'chat_history', tokenCount: 500, cacheable: false, priority: 10 }
    ],
    totalTokens: 2450,
    cacheStats: {
      inputTokens: 2450,
      cacheReadTokens: 1130,
      uncachedTokens: 1320,
      estimatedSavedCostUsd: 0.00339
    }
  }
}
```

### `ASSERTION_EVALUATED`
```typescript
{
  type: 'ASSERTION_EVALUATED',
  payload: {
    layer: 'behavioral',
    rule: 'mutation-killed-rate',
    passed: true,
    score: 85.0,
    details: 'Killed 17/20 mutants in target PaymentProcessor module.'
  }
}
```
