/**
 * Git 同步 IPC Handler
 *
 * 透传调用 upload/github 模块，处理 Git 仓库初始化、推送、远程地址查询。
 * 下层 upload/github 返回 GitResult，此处统一转换为 IpcResult。
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { successResult, errorResult } from '../shared/ipc-result';
import { initGitHubAsync, pushToGitHubAsync, getGitRemoteUrlAsync } from '../upload/github';

export function registerGitHubHandlers(): void {
  /** 初始化 Git 仓库并关联远程 origin，首次推送 */
  ipcMain.handle(IPC_CHANNELS.INIT_GITHUB, async (_event, githubUrl: string) => {
    const result = await initGitHubAsync(githubUrl);
    if (result.success) {
      return successResult(result.output || '');
    }
    return errorResult(result.error || '初始化仓库失败');
  });

  /** 拉取远程更新并推送本地变更 */
  ipcMain.handle(IPC_CHANNELS.PUSH_TO_GITHUB, async () => {
    const result = await pushToGitHubAsync();
    if (result.success) {
      return successResult(result.output || '');
    }
    return errorResult(result.error || '推送失败');
  });

  /** 获取当前 origin 远程地址（git remote get-url origin） */
  ipcMain.handle(IPC_CHANNELS.GET_GIT_URL, async () => {
    const url = await getGitRemoteUrlAsync();
    return successResult(url);
  });
}
