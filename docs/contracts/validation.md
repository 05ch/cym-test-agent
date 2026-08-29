# 数据校验与边界约束 (Validation & Schema Rules)

本文档记录协议层与执行层的输入校验规则与数据约束。

---

## 1. 实体字段校验规则

### `EvalCase`
* `id`: 必填，非空字符串，全局唯一；
* `datasetId`: 必填，必须指向已存在的 `EvalDataset`；
* `repoCommitSha`: 必填，40 位合法 Git SHA 哈希字符串；
* `targetFiles`: 必填字符串数组，至少包含 1 个有效文件相对路径，禁止包含 `../` 等目录遍历字符；
* `taskPrompt`: 必填，长度在 $[10, 50000]$ 字符以内。

### `ReproductionBundle`
* `modelConfig.temperature`: 浮点数，必须在 $[0.0, 1.0]$ 区间内；
* `modelConfig.reasoningEffort`: 枚举值可选 `'low' | 'medium' | 'high'`；
* `seed`: 整数类型，建议在 $[1, 2^{31}-1]$ 范围内以保证可复现性；
* `sandboxBackend`: 必须匹配已注册的沙箱类型 (`local`, `docker`, `firecracker`)。

---

## 2. 评分输入校验规则

### `ScoreInputs`
所有评分输入必须为 $[0, 100]$ 的合法数值：
```typescript
export interface ScoreInputs {
  correctness: number;    // 0 - 100
  mutationPower: number;  // 0 - 100
  scopeDiscipline: number;// 0 - 100
  efficiency: number;     // 0 - 100
  stability: number;      // 0 - 100
}
```
* 计算后的 `compositeScore` 必须精确到小数点后 2 位 (`toFixed(2)`)；
* 权重系数总和严格满足: $0.40 + 0.25 + 0.15 + 0.10 + 0.10 = 1.00$。

---

## 3. Capability 格式校验规则

Capability 字符串必须符合模式 `domain.action[:scope]`：
* `fs.read:<path>`
* `fs.write:<path>`
* `process.spawn:<command>`
* `git.read` / `git.write`
* `network.connect:<host>`
