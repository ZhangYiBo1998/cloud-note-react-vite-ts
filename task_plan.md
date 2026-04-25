# Task Plan: 修复 Bug + 需求迭代

## Goal
修复设置页配置不持久化、Git 同步异常，并在主界面添加手动同步按钮。

## Current Phase
Phase 3

## Phases

### Phase 1: Bug 1 — 修复设置页配置不生效
- [x] 定位根因：persistence useEffect 在 init 之前用默认值覆盖磁盘配置
- [x] 添加 `isInitialized` ref 标记，persistence 仅在 init 完成后生效
- **Status:** complete

### Phase 2: Bug 2 — 修复 Git 同步异常
- [x] 检查远程仓库配置，未配置时提前返回明确错误
- [x] `git pull --rebase` → 调整为先 commit 后 rebase pull + push，修复 rebase cannot with unstaged changes
- [x] 错误改为 toast 弹窗（useSyncStatus 添加 message.error）
- [x] SyncStatusBar 错误时仅显示"同步失败"，避免长文本 UI 错位
- **Status:** complete

### Phase 3: 需求迭代 v2
- [x] 搜索框添加 `allowClear` + 受控 `value`，支持一键清空
- [x] 备份目录添加清除按钮（`CloseOutlined`），清除时同时重置间隔为 0
- [x] 无备份目录时：间隔 Select 强制 "禁用" 且 `disabled`，立即备份按钮 `disabled`
- **Status:** complete

### Phase 4: 编译验证 & 文档
- [x] TypeScript 编译验证通过
- [x] 更新 findings.md 和 progress.md
- **Status:** complete

## Key Questions
1. 配置不持久化根因？— persistence useEffect 在 init useEffect 之前触发，用默认 state 覆盖
2. Git pull 模式？— 改用 `--rebase` 避免 merge commit
3. 同步按钮位置？— NoteGroups 工具栏 + SyncStatusBar

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| useRef 标记 `isInitialized` | 不触发额外 re-render，仅控制 effect 执行时机 |
| `git pull --rebase` | 避免合并提交，保持线性历史 |
| 按钮放在 NoteGroups 工具栏 | 与"新建笔记"并列，视觉上属于"笔记管理"区域 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- 每个 phase 完成后更新状态
- 修改前先读取目标文件确认当前内容
- 修改后确保 TypeScript 编译通过
