# 数据库与存储架构 (Database & Storage Architecture)

TestAgent Studio & Eval 采用 **SQLite (WAL 模式) + 文件/对象存储 (Artifact Store)** 的双通道存储架构。

---

## 1. 实体关系与存储分层

```text
┌─────────────────────────────────────────────────────────────┐
│                    SQLite (WAL 模式)                         │
│  • datasets / eval_cases                                    │
│  • experiment_runs                                          │
│  • sessions / session_checkpoints                           │
│  • eval_assertions                                          │
│  • artifacts (元数据 + sha256_hash + file_path)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ 指针关联 (file_path / sha256)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Local File / Object Artifact Store            │
│  • ~/.testagent/artifacts/patches/{sha256}.patch            │
│  • ~/.testagent/artifacts/logs/{sha256}.stdout              │
│  • ~/.testagent/artifacts/snapshots/{sha256}.tar.gz         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 关系表结构设计 (SQLite DDL)

### 2.1 数据集与用例表 (`datasets`, `eval_cases`)
```sql
CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS eval_cases (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    name TEXT NOT NULL,
    repo_commit_sha TEXT NOT NULL,
    target_files TEXT NOT NULL, -- JSON Array of string paths
    task_prompt TEXT NOT NULL,
    constraints TEXT NOT NULL,  -- JSON Array of string constraints
    FOREIGN KEY(dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);
```

### 2.2 实验运行与评分表 (`experiment_runs`)
```sql
CREATE TABLE IF NOT EXISTS experiment_runs (
    id TEXT PRIMARY KEY,
    eval_case_id TEXT NOT NULL,
    experiment_tag TEXT NOT NULL,
    model_id TEXT NOT NULL,
    skill_version TEXT NOT NULL,
    context_strategy TEXT NOT NULL,
    sandbox_backend TEXT NOT NULL,
    status TEXT NOT NULL, -- 'running', 'passed', 'failed'
    composite_score REAL,
    score_breakdown_json TEXT, -- JSON of CompositeScoreBreakdown
    reproduction_bundle_json TEXT NOT NULL, -- JSON of ReproductionBundle
    created_at INTEGER NOT NULL,
    finished_at INTEGER,
    duration_ms INTEGER,
    FOREIGN KEY(eval_case_id) REFERENCES eval_cases(id)
);
CREATE INDEX IF NOT EXISTS idx_runs_case ON experiment_runs(eval_case_id);
CREATE INDEX IF NOT EXISTS idx_runs_tag ON experiment_runs(experiment_tag);
```

### 2.3 会话与 Checkpoint 表 (`sessions`, `session_checkpoints`)
```sql
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    parent_session_id TEXT,
    forked_from_step INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(run_id) REFERENCES experiment_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_checkpoints (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    step_index INTEGER NOT NULL,
    checkpoint_state TEXT NOT NULL, -- JSON state snapshot pointer
    created_at INTEGER NOT NULL,
    FOREIGN KEY(sessionId) REFERENCES sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON session_checkpoints(sessionId, step_index);
```

### 2.4 产物表 (`artifacts`)
```sql
CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    artifact_type TEXT NOT NULL, -- 'patch', 'stdout', 'coverage', 'snapshot'
    file_path TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(run_id) REFERENCES experiment_runs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_artifacts_run ON artifacts(run_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_sha ON artifacts(sha256_hash);
```
