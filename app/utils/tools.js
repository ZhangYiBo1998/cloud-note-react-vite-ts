// 显示主窗口
const showMainWindow = (win) => {
  win.show();
  win.setSkipTaskbar(false);
  win.focus();
}

// 隐藏主窗口
const hideMainWindow = (win) => {
  win.hide();
  win.setSkipTaskbar(true);
}


module.exports = {
  showMainWindow,
  hideMainWindow,
};