import { exec } from 'child_process';
import { getAppSaveDirectoryAsync } from '../utils/tools';

export interface GitResult {
  success: boolean;
  output?: string;
  error?: string;
}

function executeGitCommand(command: string, options?: Record<string, unknown>): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const projectPath = await getAppSaveDirectoryAsync();
    exec(command, { cwd: projectPath, ...options } as Record<string, unknown> & { cwd: string }, (error, stdout, stderr) => {
      if (error) {
        console.error(`命令执行失败: ${command}`, error);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function checkGitStatusChange(): Promise<boolean> {
  const statusOutput = await executeGitCommand('git status --porcelain');
  return statusOutput.trim().length > 0;
}

export async function initGitHubAsync(url: string): Promise<GitResult> {
  try {
    console.log('开始初始化 GitHub 仓库...');
    await executeGitCommand('git init');
    console.log('Git 初始化完成');

    try {
      await executeGitCommand('git remote remove origin');
      console.log('已移除原有 origin');
    } catch {
      console.log('没有已存在的 origin 或移除失败，继续执行...');
    }

    await executeGitCommand(`git remote add origin ${url}`);
    console.log('远程仓库添加完成');

    await executeGitCommand('git add .');
    console.log('文件已添加到暂存区');

    await executeGitCommand(`git commit -m "init-save from cloudNote ${new Date().toLocaleString()}"`);
    console.log('初始提交完成');

    try {
      await executeGitCommand('git branch -M master');
      console.log('分支重命名为 master');
    } catch {
      console.log('分支重命名失败或不需要重命名');
    }

    await executeGitCommand('git push -u origin master');
    console.log('成功链接 GitHub仓库！');
    return { success: true, output: 'GitHub 仓库初始化成功' };
  } catch (error) {
    console.error('链接失败：', error);
    return { success: false, error: String(error) };
  }
}

export async function getGitRemoteUrlAsync(): Promise<string> {
  try {
    const url = await executeGitCommand('git remote get-url origin');
    return url.trim();
  } catch {
    return '';
  }
}

export async function pushToGitHubAsync(): Promise<GitResult> {
  try {
    await executeGitCommand('git pull origin master');
    console.log('拉取最新数据');

    if (await checkGitStatusChange()) {
      console.log('开始推送更改到 GitHub...');
      await executeGitCommand('git add .');
      console.log('文件已暂存');

      await executeGitCommand(`git commit -m "Auto-save from cloudNote ${new Date().toLocaleString()}"`);
      console.log('更改已提交');

      await executeGitCommand('git push origin master');
      console.log('成功推送到 GitHub！');
      return { success: true, output: '同步成功' };
    } else {
      console.log('没有检测到更改，跳过推送。');
      return { success: true, output: '没有变更，跳过同步' };
    }
  } catch (error) {
    console.error('推送失败：', error);
    return { success: false, error: String(error) };
  }
}
