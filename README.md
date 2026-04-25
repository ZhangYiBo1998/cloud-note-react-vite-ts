# CloudNote

一款基于 Electron 的本地优先桌面笔记应用，支持 Markdown / 富文本 / 纯文本三种编辑模式，集成 Git 云端同步与定时本地备份。

## 功能特性

### 笔记管理
- **分组树形管理** — 以分组（文件夹）组织笔记，侧边栏树形展示，支持新建、删除、重命名
- **三种编辑器** — 根据文件扩展名自动切换：
  - `.txt` — 纯文本编辑（Ant Design `Input.TextArea`）
  - `.md` — WYSIWYG Markdown 编辑（ToastUI Editor，支持图表、UML、代码高亮、合并单元格）
  - `.html` — 富文本编辑（TipTap / ProseMirror，工具栏支持加粗、斜体、下划线、删除线、标题、列表、引用）
- **标签系统** — 每篇笔记可自由添加标签，标签变更实时持久化
- **自动保存** — 3 秒防抖自动写入磁盘，无需手动保存

### 搜索
- **三种搜索模式** — 按文件名、按标签、按文件内容
- **全文搜索** — 内容搜索通过主进程 IPC 遍历所有笔记文件，大小写不敏感，返回匹配摘要片段
- **实时过滤** — 文件名/标签搜索为客户端侧过滤，即时响应

### 云端同步（Git）
- **Git 集成** — 在笔记存档目录内自动管理 Git 仓库（`git init` → `add` → `commit` → `pull --rebase` → `push`）
- **自动同步** — 每 5 分钟自动推送变更到远程仓库
- **手动同步** — 侧边栏底部同步状态栏支持一键同步 / 失败重试
- **初始化引导** — 设置页可配置远程仓库地址，自动完成首次推送
- **退出时同步** — 应用退出前自动尝试推送未提交变更

### 本地备份
- **定时自动备份** — 可配置间隔（15 分钟 / 30 分钟 / 1 小时 / 6 小时 / 12 小时 / 24 小时）
- **手动备份** — 一键触发完整备份
- **增量留存** — 最多保留 10 份历史备份，自动清理过期备份
- **自定义备份目录** — 支持任意本地目录作为备份存放位置

### 界面与体验
- **深色/浅色主题** — Apple 风格中性色板，一键切换
- **自定义标题栏** — 无框窗口（`frame: false`），支持拖拽移动、最小化到托盘、关闭行为配置
- **可拖拽侧边栏** — 侧边栏宽度可拖拽调节（180–500px），支持折叠，宽度持久化到 `localStorage`
- **窗口置顶** — 一键切换窗口始终置顶
- **系统托盘** — 托盘图标右键菜单（显示 / 设置 / 退出），双击切换窗口可见性
- **快捷键**：
  - 全局快捷键（默认 `Alt+Space`）显示/隐藏应用，支持在设置页自定义
  - 开发者工具快捷键（默认 `Ctrl+Shift+I`），支持自定义
  - `Ctrl+N` 等快捷键组合（焦点不在输入框时生效）

### 设置与配置
- 外观主题切换
- 开机自启
- 关闭行为（最小化到托盘 / 退出）
- 全局快捷键自定义（录制器弹窗）
- 存档目录选择
- Git 仓库地址配置（带二次确认）
- 备份目录与间隔配置
- 配置持久化到 `config.json`，变更自动写入磁盘

## 技术栈

| 层级 | 技术 |
|------|------|
| **桌面框架** | Electron 41（`contextIsolation: true`，`nodeIntegration: false`） |
| **前端框架** | React 18 + TypeScript 6 |
| **构建工具** | Vite 8（渲染进程）、tsc（主进程） |
| **UI 组件库** | Ant Design 6 + `@ant-design/icons` |
| **路由** | React Router 7（Hash 路由） |
| **文本编辑器** | ToastUI Editor 3（Markdown）、TipTap 3（HTML 富文本） |
| **样式** | SCSS + CSS 自定义属性（主题变量） |
| **打包分发** | Electron Forge 7（Squirrel / ZIP / deb / RPM） |
| **后端/系统** | Node.js `child_process`（Git 操作）、`fs/promises`（文件系统） |
| **代码质量** | ESLint 10 + TypeScript-ESLint |
| **并行任务** | concurrently（开发模式并行启动 Vite + tsc + Electron） |

## 项目结构

```
cloud-note/
├── app/                          # Electron 主进程
│   ├── main.ts                   # 入口：窗口管理、系统托盘、快捷键、生命周期
│   ├── preload.ts                # contextBridge 安全暴露 IPC API
│   ├── app-shortcut.ts           # 全局快捷键注册/注销
│   ├── ipc-handlers/             # IPC 处理器
│   │   ├── index.ts              # 统一注册入口
│   │   ├── window.ts             # 窗口控制（隐藏、最小化、关闭、置顶、DevTools）
│   │   ├── config.ts             # config.json 读写、开机自启、目录选择
│   │   ├── notes.ts              # 笔记文件创建/读取/写入
│   │   ├── groups.ts             # 分组 CRUD、笔记重命名、标签管理
│   │   ├── github.ts             # Git 同步操作透传
│   │   ├── search.ts             # 全文搜索
│   │   └── backup.ts             # 本地备份操作
│   ├── upload/
│   │   └── github.ts             # Git 命令执行（child_process.exec）
│   ├── backup/
│   │   └── backup.ts             # 备份调度器与文件复制
│   ├── utils/
│   │   └── tools.ts              # 共享工具：文件读写、配置管理、分组映射
│   └── shared/
│       ├── ipc-channels.ts       # IPC 通道常量
│       └── ipc-result.ts         # 统一返回类型 IpcResult
├── src/                          # React 渲染进程
│   ├── main.tsx                  # React 入口
│   ├── App.tsx                   # 根组件：配置加载、Context 提供、主题切换
│   ├── router/index.tsx          # Hash 路由配置
│   ├── pages/
│   │   ├── home/
│   │   │   ├── index.tsx         # 主页布局（侧边栏 + 内容区 + 搜索）
│   │   │   ├── NoteEdit.tsx      # 笔记编辑器（按扩展名切换编辑器）
│   │   │   └── components/
│   │   │       ├── NoteGroups.tsx      # 笔记树 + 右键菜单
│   │   │       ├── NoteSearch.tsx      # 搜索栏（类型选择 + 输入框）
│   │   │       ├── CreateNewModal.tsx  # 新建笔记/分组弹窗
│   │   │       ├── ToastUIEditor/     # ToastUI Markdown 编辑器
│   │   │       └── HtmlEditor/        # TipTap 富文本编辑器
│   │   └── setting/
│   │       └── index.tsx         # 设置页（主题、快捷键、目录、Git、备份）
│   ├── components/
│   │   ├── SystemHeader/         # 自定义标题栏
│   │   └── SyncStatusBar/        # Git 同步状态栏
│   ├── hooks/
│   │   ├── useSyncStatus.tsx     # Git 同步状态管理（状态机 + 5 分钟自动同步）
│   │   ├── useKeyboardShortcuts.tsx  # 全局键盘快捷键
│   │   ├── useShortcut.ts        # 可配置快捷键解析与注册
│   │   └── useResizablePanel.ts  # 侧边栏拖拽调整宽度
│   ├── pages/hooks/useNoteInfo.tsx   # 笔记数据 Hook
│   ├── utils/
│   │   ├── context.tsx           # 全局 Context 定义
│   │   ├── Enums.ts              # 文件类型枚举
│   │   └── tool.ts               # 工具函数（debounce）
│   ├── theme/tokens.ts           # Ant Design 亮色/暗色主题令牌
│   └── types/
│       ├── index.d.ts            # 核心类型定义
│       └── global.d.ts           # window.electronAPI 类型 + IPC 返回类型
├── vite.config.ts                # Vite 配置
├── forge.config.js               # Electron Forge 打包配置
├── tsconfig.json                 # TypeScript 根配置
├── tsconfig.app.json             # 渲染进程 TypeScript 配置
├── tsconfig.node.json            # 主进程 TypeScript 配置
└── package.json                  # 依赖与脚本
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
git clone <repo-url>
cd cloud-note
npm install
```

### 开发模式

启动开发服务器（Vite HMR + Electron 开发模式）：

```bash
npm run dev
```

这将会：
1. 编译 `app/` 主进程 TypeScript 代码
2. 启动 Vite 开发服务器（端口 5173，HMR 热更新）
3. 启动 Electron 窗口，加载 Vite 开发服务器

### 生产构建

```bash
npm run build
```

构建主进程和渲染进程代码到 `dist/` 目录。

### 打包分发

```bash
npm run make
```

使用 Electron Forge 打包为可分发格式（Windows Squirrel、macOS ZIP、Linux deb/rpm）。

## 配置

应用配置存储在 `<userDocuments>/cloudNote/config.json`，主要字段：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `saveDirectory` | string | `~/Documents/cloudNote/save` | 笔记存档目录 |
| `theme` | `"light"` / `"dark"` | `"light"` | 外观主题 |
| `closeType` | `"hide"` / `"quit"` | `"hide"` | 关闭窗口行为 |
| `globalShortcut` | string | `"Alt+Space"` | 全局显示/隐藏快捷键 |
| `devToolsShortcut` | string | `"Ctrl+Shift+I"` | 开发者工具快捷键 |
| `backupDirectory` | string | `""` | 本地备份存放目录 |
| `backupIntervalMinutes` | number | `0` | 自动备份间隔（分钟），`0` 表示禁用 |

## 架构说明

### 进程模型

应用采用 **Electron 双进程模型**：

- **主进程**（`app/`）：负责窗口生命周期、系统托盘、全局快捷键、文件 I/O、Git 操作、备份调度。所有文件系统操作和外部命令执行都在主进程完成，通过 IPC 暴露给渲染进程。
- **渲染进程**（`src/`）：React 单页应用，负责 UI 渲染和用户交互。通过 `window.electronAPI`（contextBridge 注入）调用主进程能力。

### 通信机制

渲染进程 ↔ 主进程之间使用 **IPC**（`ipcMain.handle` / `ipcRenderer.invoke`）双向通信，统一返回 `IpcResult<T>` 结构：

```typescript
interface IpcResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

渲染进程始终先检查 `result.success` 再消费 `data` 字段。

### 数据存储

```
<userDocuments>/cloudNote/
├── config.json                   # 应用配置
└── save/                         # 笔记存档目录
    ├── groups.json               # 笔记分组元数据
    ├── <分组名>/
    │   ├── <笔记名>.txt
    │   ├── <笔记名>.md
    │   └── <笔记名>.html
    └── ...
```

### 缓存机制

主进程使用 `global.app_*` 缓存配置和分组数据，避免频繁磁盘 I/O：

- `global.app_config` — 配置缓存
- `global.app_groupsConfig` — 分组元数据缓存
- `global.app_groupsConfigMap` — 扁平化 key → item 映射（O(1) 查找）

### Git 同步流程

```
[自动/手动触发] → git add . → git commit → git pull --rebase origin master → git push origin master
```

- 无变更时跳过 `commit` 步骤
- 退出应用时自动同步（`will-quit` 事件）
- 同步链路从 `useSyncStatus` Hook 开始 → IPC → `upload/github.ts` → `child_process.exec`

### 编辑器的文件类型路由

```
NoteEdit.tsx 检测文件扩展名
├── .txt  → Input.TextArea（纯文本）
├── .md   → ToastUIEditor（Markdown WYSIWYG）
└── .html → HtmlEditor（TipTap 富文本）
```

## 依赖清单

### 运行时依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `react` | 18.3.1 | UI 框架 |
| `react-dom` | 18.3.1 | DOM 渲染 |
| `react-router` | ^7.9.4 | 前端路由（Hash） |
| `antd` | ^6.3.6 | UI 组件库 |
| `@ant-design/icons` | ^6.1.1 | 图标集 |
| `@tiptap/react` | ^3.22.4 | TipTap 富文本编辑器 |
| `@tiptap/starter-kit` | ^3.22.4 | TipTap 基础扩展 |
| `@tiptap/extension-underline` | ^3.22.4 | TipTap 下划线扩展 |
| `@toast-ui/editor` | ^3.2.2 | Markdown WYSIWYG 编辑器 |
| `@toast-ui/editor-plugin-chart` | ^3.0.1 | 图表插件 |
| `@toast-ui/editor-plugin-code-syntax-highlight` | ^3.1.0 | 代码高亮插件 |
| `@toast-ui/editor-plugin-color-syntax` | ^3.1.0 | 颜色语法插件 |
| `@toast-ui/editor-plugin-table-merged-cell` | ^3.1.0 | 合并单元格插件 |
| `@toast-ui/editor-plugin-uml` | ^3.0.1 | UML 图表插件 |
| `electron-squirrel-startup` | ^1.0.1 | Windows Squirrel 安装事件处理 |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `electron` | ^41.3.0 | 桌面框架 |
| `@electron-forge/cli` | ^7.11.1 | 应用打包/发布 |
| `@electron-forge/maker-squirrel` | ^7.11.1 | Windows 安装包制作 |
| `@electron-forge/maker-zip` | ^7.11.1 | macOS ZIP 制作 |
| `@electron-forge/maker-deb` | ^7.11.1 | Linux deb 制作 |
| `@electron-forge/maker-rpm` | ^7.11.1 | Linux rpm 制作 |
| `@electron-forge/plugin-auto-unpack-natives` | ^7.11.1 | 原生模块自动解包 |
| `@electron-forge/plugin-fuses` | ^7.11.1 | Electron Fuse 配置 |
| `@electron/fuses` | ^1.8.0 | 安全功能开关 |
| `vite` | ^8.0.10 | 前端构建工具 |
| `@vitejs/plugin-react` | ^6.0.1 | React Vite 插件 |
| `typescript` | ~6.0.2 | TypeScript 编译器 |
| `sass` | ^1.99.0 | SCSS 编译 |
| `sass-loader` | ^16.0.7 | Webpack SCSS loader（Forge 构建使用） |
| `eslint` | ^10.2.1 | 代码检查 |
| `typescript-eslint` | ^8.58.2 | TypeScript ESLint 规则 |
| `concurrently` | ^9.2.1 | 并行执行多任务 |
| `cross-env` | ^10.1.0 | 跨平台环境变量设置 |
| `@types/react` | ^18.3.28 | React 类型定义 |
| `@types/react-dom` | ^18.3.7 | ReactDOM 类型定义 |
| `@types/node` | ^24.12.2 | Node.js 类型定义 |

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发模式（Vite HMR + Electron） |
| `npm run build` | 构建主进程 + 渲染进程 |
| `npm run start` | 构建并启动 Electron（生产模式） |
| `npm run make` | 构建并打包为可分发的安装包 |
| `npm run package` | 构建并打包为可执行文件 |
| `npm run preview` | 预览 Vite 构建产物 |

## 常见问题

### 笔记存储在什么位置？
默认路径为 `<用户文档目录>/cloudNote/save/`，可在设置页自由修改。

### 如何备份笔记？
在设置页配置备份目录和自动备份间隔，或点击"立即备份"手动触发。备份文件存储在指定目录下的 `backup-<时间戳>/` 文件夹中，最多保留 10 份。

### 如何同步到云端？
在设置页的"Git 仓库地址"中输入远程仓库 URL 并保存，应用会自动完成 `git init` 和首次推送。之后每 5 分钟自动同步，也可点击侧边栏底部的同步按钮手动触发。

### 如何恢复备份？
打开备份目录，找到对应时间戳的备份文件夹，将其内容复制到笔记存档目录即可。

### 关闭窗口后应用还在运行吗？
默认情况下，关闭按钮会隐藏窗口到系统托盘（进程仍在后台运行）。可在设置页修改为"关闭时退出"。

## 许可

MIT License
