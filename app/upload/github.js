// 在主进程中
const {exec} = require('child_process');

const {
  getAppSaveDirectoryAsync,
} = require('../utils/tools');

function executeGitCommand(command, options) {
  return new Promise(async (resolve, reject) => {
    // 你的本地 Git 仓库路径
    const projectPath = await getAppSaveDirectoryAsync();
    exec(command, {cwd: projectPath, ...options}, (error, stdout, stderr) => {
      if (error) {
        console.error(`命令执行失败: ${command}`, error);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function checkGitStatusChange() {
  const statusOutput = await executeGitCommand('git status --porcelain');
  return statusOutput.trim().length > 0;
}

async function initGitHubAsync(url) {
  try {
    console.log('开始初始化 GitHub 仓库...');
    // 1. 初始化 Git 仓库
    await executeGitCommand(`git init`);
    console.log('Git 初始化完成');

    // 2. 移除已存在的 origin（如果有）
    try {
      await executeGitCommand(`git remote remove origin`);
      console.log('已移除原有 origin');
    } catch (error) {
      console.log('没有已存在的 origin 或移除失败，继续执行...');
    }

    // 3. 添加远程仓库
    await executeGitCommand(`git remote add origin ${url}`);
    console.log('远程仓库添加完成');

    // 4. 添加所有文件到暂存区
    await executeGitCommand(`git add .`);
    console.log('文件已添加到暂存区');

    // 5. 提交更改（这是关键步骤！）
    await executeGitCommand(`git commit -m "init-save from cloudNote ${new Date().toLocaleString()}"`);
    console.log('初始提交完成');

    // 6. 重命名分支为 master（如果需要）
    try {
      await executeGitCommand(`git branch -M master`);
      console.log('分支重命名为 master');
    } catch (error) {
      console.log('分支重命名失败或不需要重命名');
    }

    // 7. 推送到远程仓库
    await executeGitCommand('git push -u origin master');
    console.log('成功链接 GitHub仓库！');
  } catch (error) {
    console.error('链接失败：', error);
    throw error;
  }
}

async function pushToGitHubAsync() {
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
    } else {
      console.log('没有检测到更改，跳过推送。');
    }
  } catch (error) {
    console.error('推送失败：', error);
    throw error;
  }
}


module.exports = {
  initGitHubAsync,
  pushToGitHubAsync,
};