# Progress Log

## Session: 2026-04-25

### Phase 1: Bug 1 — 修复设置页配置不生效
- **Status:** complete
- **Root cause:** persistence useEffect(settings.theme) 在 init useEffect 之前触发，用默认 `{theme: 'light'}` 覆盖磁盘中的 `{theme: 'dark'}`
- **Fix:** 添加 `useRef` 标记 `isInitialized`，persistence effect 在 init 完成后才允许写入
- Files modified: App.tsx

### Phase 2: Bug 2 — 修复 Git 同步异常
- **Status:** complete
- **Changes:** 
  - `git pull origin master` → `git pull --rebase origin master`，避免不必要的 merge commit
  - 添加远程仓库检查，未配置时返回明确错误信息
- Files modified: upload/github.ts

### Phase 2: Bug 2 — 修复 Git 同步异常 + toast 弹窗
- **Status:** complete
- **Root cause:** git pull --rebase 要求工作区干净，但代码在 commit 之前就 rebase pull
- **Fix:**
  - github.ts: git add → git commit → git pull --rebase → git push（先提交再 rebase pull）
  - useSyncStatus.tsx: pushNow 失败时调用 `message.error()` 弹出 toast
  - SyncStatusBar: 错误时仅显示"同步失败"短文本，避免长错误信息 UI 错位
- Files modified: upload/github.ts, useSyncStatus.tsx, SyncStatusBar/index.tsx

### Phase 3: 需求 3 — 主界面手动同步按钮
- **Status:** complete
- **Changes:**
  - NoteGroups: 添加 `onSyncNow`/`syncStatus` props，工具栏增加同步按钮（与"新建笔记"并列）
  - SyncStatusBar: 始终显示"同步"/"重试"链接（不限于 error 状态）
  - Home: 透传 `sync.pushNow` 和 `sync.status` 到 NoteGroups
- Files modified: NoteGroups.tsx, SyncStatusBar/index.tsx, Home/index.tsx

### Test Results
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|

### Error Log
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|

### 需求迭代 v2：搜索清空 + 备份目录增强
- **Status:** complete
- **Changes:**
  - NoteSearch: 添加 `value` prop + `allowClear`，实现一键清空搜索框
  - Home: 透传 `searchTerm` 作为 `value` 到 NoteSearch
  - Setting: 备份目录添加清除按钮（`CloseOutlined`），清除时同时重置间隔为 0
  - Setting: 无备份目录时，间隔 Select 强制 "禁用" + `disabled`，立即备份按钮 `disabled`
- Files modified: NoteSearch.tsx, Home/index.tsx, Setting/index.tsx

### 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | Phase 3 — 需求迭代完成 |
| Where are we going? | — |
| What's the goal? | 修复 Bug + 需求迭代 |
| What have I learned? | See findings.md |
| What have I done? | Bug 1+2 三处修复，需求 1-3 三处迭代 |
