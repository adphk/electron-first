const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let win;

// 创建窗口
function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // 预加载 脚本
      sandbox: true
    }
  });

  // ipcMain IPC主线程 处理 ping请求，返回pong字符串
  ipcMain.handle('ping', () => 'pong');  // ping方法在 preload.js 中定义

  // win.loadURL('https://google.com')
  win.loadFile('index.html');
}

// 通知栏 图标
function trayHander() {
  const iconPath = path.join(__dirname, 'assets/electron_icon.png')
  let tray = new Tray(iconPath)
  tray.setToolTip('Hello Electron')
  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
  })
  tray.on('right-click', () => {
    const menuConfig = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ])
    tray.popUpContextMenu(menuConfig)
  })
}

/* 旧版code
app.on('ready').then(() => {
  createWindow();
});
*/

// 一切开始 app模块 ready后，才能做 创建窗口等事件
app.whenReady().then(() => {
  createWindow();

  trayHander();

  // 如果没有窗口打开则打开一个窗口 (MacOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 关闭所有窗口时退出应用，不适用于MacOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {    // MacOS(darwin)
    app.quit();
  }
});