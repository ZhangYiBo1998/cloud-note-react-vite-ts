/**
 * Git 操作模块
 *
 * 在笔记存档目录内执行 git 命令，提供仓库初始化、推送、远程地址查询。
 * 所有 git 操作通过 child_process.exec 执行，cwd 为存档目录。
 * 返回统一的 GitResult { success, output/error } 结构，永不 throw。
 */

import { exec } from 'child_process';
import { getAppSaveDirectoryAsync } from '../utils/tools';

/** Git 操作结果 */
export interface GitResult {
  success: boolean;
  output?: string;
  error?: string;
}

/**
 * 在存档目录中执行 git 命令
 * @param command 要执行的 git 命令
 * @param options exec 额外选项
 * @returns stdout 输出
 */
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

/** 检查工作区是否有未提交的变更 */
async function checkGitStatusChange(): Promise<boolean> {
  const statusOutput = await executeGitCommand('git status --porcelain');
  return statusOutput.trim().length > 0;
}

/**
 * 初始化 Git 仓库并关联远程 origin
 * 1. git init → git remote remove origin → git remote add origin <url>
 * 2. git add . → git commit → git branch -M master → git push -u origin master
 */
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

/** 获取当前 origin 远程 URL，未配置时返回空字符串 */
export async function getGitRemoteUrlAsync(): Promise<string> {
  try {
    const url = await executeGitCommand('git remote get-url origin');
    return url.trim();
  } catch {
    return '';
  }
}

/**
 * 推送到 GitHub
 * 先提交本地变更 → 拉取远程更新（rebase）→ 推送
 * 无变更时跳过推送
 */
export async function pushToGitHubAsync(): Promise<GitResult> {
  try {
    // 检查是否有远程仓库配置
    const remoteUrl = await getGitRemoteUrlAsync();
    if (!remoteUrl) {
      return { success: false, error: '未配置 Git 远程仓库地址，请在设置中配置' };
    }

    if (await checkGitStatusChange()) {
      console.log('开始推送更改到 GitHub...');
      await executeGitCommand('git add .');
      console.log('文件已暂存');

      await executeGitCommand(`git commit -m "Auto-save from cloudNote ${new Date().toLocaleString()}"`);
      console.log('更改已提交');
    } else {
      console.log('没有检测到更改，跳过本地提交。');
    }

    // 先提交再 rebase pull（rebase 要求工作区干净）
    await executeGitCommand('git pull --rebase origin master');
    console.log('拉取最新数据');

    await executeGitCommand('git push origin master');
    console.log('成功推送到 GitHub！');
    return { success: true, output: '同步成功' };
  } catch (error) {
    console.error('推送失败：', error);
    return { success: false, error: String(error) };
  }
}
