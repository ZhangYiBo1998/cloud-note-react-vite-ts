/**
 * IPC Handler 注册汇总
 *
 * 所有 handler 模块在此聚合并统一注册。
 * 新增 handler 步骤：
 * 1. 新建 app/ipc-handlers/xxx.ts，导出 registerXxxHandlers()
 * 2. 在此文件 import 并调用
 */
import { registerWindowHandlers } from './window';
import { registerConfigHandlers } from './config';
import { registerNotesHandlers } from './notes';
import { registerGroupsHandlers } from './groups';
import { registerGitHubHandlers } from './github';
import { registerSearchHandlers } from './search';
import { registerBackupHandlers } from './backup';

/** 注册所有 IPC handler，在 app.whenReady 时调用 */
export function registerAllHandlers(): void {
  registerWindowHandlers();
  registerConfigHandlers();
  registerNotesHandlers();
  registerGroupsHandlers();
  registerGitHubHandlers();
  registerSearchHandlers();
  registerBackupHandlers();
}
