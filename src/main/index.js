import { app, shell, BrowserWindow, protocol, net } from 'electron';
import path from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { initial } from '../utils';
import './main-process-modules/handler';
import { downloadWorker } from '../workers';
import icon from '../../resources/icon.png?asset';
import packageJson from '../../package.json';
import log from 'electron-log/main';
import { trayApp } from './view';

const { downloadFiles } = downloadWorker;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'localurl',
    privileges: {
      bypassCSP: true,
      stream: true
    }
  }
]);

app.whenReady().then(() => {
  protocol.handle('localurl', (request) => {
    const url = request.url.replace(/^localurl:\/\//, '');
    try {
      return net.fetch(`file:///${url}`);
    } catch (error) {
      console.error('ERROR: Registering localurl protocol:', error);
    }
  });
});

async function createWindow() {
  initial.initialDefaultFolder();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    alwaysOnTop: !is.dev,
    resizable: false,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true
    }
  });

  const tray = trayApp.initTray();
  tray.setToolTip('uvplayer-lite');
  tray.setContextMenu(trayApp.createContextMenu(mainWindow));

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  await runWorkers();
}

async function runWorkers() {
  try {
    await downloadFiles();
  } catch (error) {
    log.error(error);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.ii-uvp');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
log.warn(`The program is running. App version: ${packageJson.version}`);
