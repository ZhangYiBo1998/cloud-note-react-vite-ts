# Findings & Decisions

## Requirements
- 修复代码审查发现的所有 14 个问题
- 问题覆盖 P0（Bug）、P1（功能缺陷）、P2（代码质量）
- 所有修改需保持现有功能不退化

## Research Findings

### useCallback + debounce 反模式
- `debounce(func, wait)` 每次调用返回**新函数**
- `useCallback(fn, deps)` 在 deps 变化时返回新引用
- 组合使用时，每次 deps 变化旧防抖定时器丢失
- **标准解法**: 用 `useRef` 持久化 debounced 函数，或用 `useMemo` + 空依赖

### ToastUIEditor API 能力
- 支持 `setMarkdown(value)` 更新编辑器内容
- 支持 `setHtml(value)` 更新 HTML 内容
- Editor 实例已通过 `editorInsRef.current` 持有

### window.electronAPI 可选链问题
- `electronAPI` 通过 preload 脚本注入，非 Electron 环境为 `undefined`
- 直接调用 `.method()` 会抛 `TypeError: Cannot read properties of undefined`
- `?.` 可选链是标准解法

### __closeType 全局变量
- App.tsx 写: `(window as any).__closeType = settings.closeType`
- SystemHeader.tsx 读: `const closeType = (window as any).__closeType`
- SettingsContext 已经可用，SystemHeader 可直接 `useContext(SettingsContext)` 读取

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 创建 `useDebounce` hook 替代 useCallback+debounce | 独立可复用，语义清晰 |
| ToastUIEditor 通过 `setMarkdown` 响应 `value` prop | 最小改动，复用已有实例 |
| SystemHeader 使用 `SettingsContext` 替代全局变量 | 保持一致的数据流模式 |
| 使用 `useMemo` 包裹 `useNoteInfo` 返回值 | 稳定引用，恢复 memo 优化 |
| `@ts-expect-error` 改为实际类型修复 | 恢复 TypeScript 类型安全 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| 设置页配置不持久化 | persistence useEffect 初始挂载时用默认 state 覆盖磁盘配置 → useRef isInitialized 标记 |
| Git 同步异常 | `git pull` 会创建 merge commit，冲突时失败 → 改用 `git pull --rebase` |
| 无远程仓库时同步崩溃 | pushToGitHubAsync 直接 `git pull` 会报错 → 先检查 `getGitRemoteUrlAsync()` |

## Bug 1 根因详解
- App.tsx 中 **初始化顺序**：
  1. `useState<ISettings>({ theme: 'light', closeType: 'hide' })` — 默认值
  2. persistence useEffect **先触发**：`updateConfigJsonAsync({ theme: 'light' })` → 写入磁盘覆盖真实配置
  3. init useEffect **后触发**：从磁盘读配置 → `setSettings({ theme: 'dark' })`
  4. 但步骤 2 已经将磁盘中的配置改回了 `light`，所以重启后始终是 light
- **修复**：添加 `useRef(false)` 标记，persistence 只有 init 完成后才执行

## Bug 2 详解
- `pushToGitHubAsync` 在 `useSyncStatus` 中每 5 分钟自动调用
- 原代码 `git pull origin master`（无 rebase）在分支分叉时产生 merge commit，可能导致冲突
- 修复：`git pull --rebase` + 提前检查 remote URL

## 需求 3 设计
- NoteGroups 工具栏添加同步按钮（与"新建笔记"并列）
- SyncStatusBar 始终显示同步触发器
- 通过 Home 组件透传 `useSyncStatus` 的 `pushNow` 和 `status`

## Resources
- [NoteEdit.tsx](src/pages/home/NoteEdit.tsx)
- [ToastUIEditor/index.tsx](src/pages/components/ToastUIEditor/index.tsx)
- [SystemHeader/index.tsx](src/components/SystemHeader/index.tsx)
- [tool.ts](src/utils/tool.ts)
- [useNoteInfo.tsx](src/pages/hooks/useNoteInfo.tsx)
- [App.tsx](src/App.tsx)
- [NoteGroups.tsx](src/pages/home/components/NoteGroups.tsx)
- [Setting.tsx](src/pages/setting/index.tsx)
- [Enums.ts](src/utils/Enums.ts)
- [Icon.tsx](src/pages/components/Icon.tsx)
