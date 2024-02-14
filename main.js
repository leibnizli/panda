const isMac = process.platform === 'darwin'
const {app, BrowserWindow, ipcMain, dialog, shell, Menu} = require('electron');
const path = require('path')
const url = require('url')
  mainWindow = null;
app.on('window-all-closed', function () {
  // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
  // 应用会保持活动状态
  if (process.platform != 'darwin') {
    app.quit();
  }
});
// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候
// 这个方法就被调用
app.on('ready', function () {
  // 创建浏览器窗口。
  mainWindow = new BrowserWindow({
    icon: './build/icon.png',
    title: 'Panda v1.2.0',
    width: 345,
    height: 528,
    minWidth:280,
    minHeight:428,
    frame: true,
    resizable: true,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false
    }
  });

  // 加载应用的 index.html
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // 打开开发工具
  // mainWindow.openDevTools();
  // 当 window 被关闭，这个事件会被发出
  mainWindow.on('closed', function () {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，通常会把多个 window 对象存放在一个数组里面，但这次不是。
    mainWindow = null;
  });
  mainWindow.webContents.on('did-finish-load', function () {
  });
});
ipcMain.on('close-main-window', function () {
  app.quit();
});
ipcMain.on('main-minimized', function () {
  mainWindow.minimize();
});
ipcMain.handle('dialog:openMultiFileSelect', () => {
  let options = {
    properties: ['openFile', 'multiSelections']
  };
  return dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    .then((result) => {
      // Bail early if user cancelled dialog
      if (result.canceled) { return }
      return result.filePaths;
    })
})
const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }]
    : []),
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ]
        : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ]
        : [
          { role: 'close' }
        ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Report An Issue..',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://github.com/leibnizli/panda/issues')
        }
      },
      {
        label: 'Website',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://arayofsunshine.dev/')
        }
      },
      {
        label: 'Buy Me A Coffee',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://buy.arayofsunshine.dev/')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
