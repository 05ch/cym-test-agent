# 终端与前端交互设计 (Frontend & TUI Interaction)

本文档记录 TestAgent Studio & Eval 终端客户端 (`@testagent/tui`) 与 Web 控制台的交互设计规范与快捷键映射。

---

## 1. 终端 TUI 设计哲学与布局

`@testagent/tui` 采用**键盘优先 (Keyboard-First)、高信息密度、零延迟**的终端界面：

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Header: [● RUNNING] Case: payment-core-eval | Model: claude-3-7-sonnet │
│ Tokens: In 2,450 | Out 970 | Cache Saved 1,800 tokens ($0.0054)         │
│ Tabs: [1] Trace DAG  [2] Diff  [3] Stdout  [4] ScoreCard  [5] Help    │
├────────────────────────────────────────────────────────────────────────┤
│ Main View Area (DAG Flow / Git Diff / Stdout Logs / Score Breakdown)   │
│                                                                        │
│  [Step 1: Init] ──► [Step 2: Read AST] ──► [Step 3: Gen Tests] ──► ... │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ Footer: [q] Quit  [d] Diff  [t] Stdout  [Space] Play/Pause  [Ctrl+R]   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 核心快捷键清单

| 按键 | 功能说明 | 实现状态 |
| :--- | :--- | :--- |
| `1` - `5` | 直接切换视图 Tab (1: DAG, 2: Diff, 3: Stdout, 4: Score, 5: Help) | Code-Verified (`cli.tsx`) |
| `d` | 快速在当前视图与 Git Diff 补丁视图之间来回切换 | Code-Verified (`cli.tsx`) |
| `t` | 快速在当前视图与 Terminal Stdout 运行日志之间来回切换 | Code-Verified (`cli.tsx`) |
| `Space` | 播放 / 暂停单步执行模拟流 | Code-Verified (`cli.tsx`) |
| `h` / `l` 或 `←` / `→` | 在执行步骤 (Steps) 间切换查看详情 | Code-Verified (`cli.tsx`) |
| `Ctrl + C` | 优雅中断 / 暂停正在运行中的 Agent 会话 | Code-Verified (`cli.tsx`) |
| `Ctrl + R` | 快速重试：从第一步重新拉起当前上下文 | Code-Verified (`cli.tsx`) |
| `a` / `x` | 越权拦截模态框下快速批准 (`a`) 或拒绝 (`x`) Capability 请求 | Code-Verified (`cli.tsx`) |
| `q` | 退出终端 TUI 客户端 | Code-Verified (`cli.tsx`) |
