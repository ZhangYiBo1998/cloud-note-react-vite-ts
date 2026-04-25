import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { initGitHubAsync, pushToGitHubAsync, getGitRemoteUrlAsync } from '../upload/github';

export function registerGitHubHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.INIT_GITHUB, async (_event, githubUrl: string) => {
    return await initGitHubAsync(githubUrl);
  });

  ipcMain.handle(IPC_CHANNELS.PUSH_TO_GITHUB, async () => {
    return await pushToGitHubAsync();
  });

  ipcMain.handle(IPC_CHANNELS.GET_GIT_URL, async () => {
    return await getGitRemoteUrlAsync();
  });
}
