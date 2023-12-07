import { app, shell, BrowserWindow, protocol, net, dialog } from 'electron';
import path from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { store, initial } from '../utils';
import './main-process-modules/handler';
import { airtimeWorker, deviceWorker, downloadWorker, uploadWorker } from '../workers';
import icon from '../../resources/icon.png?asset';
import packageJson from '../../package.json';
import Sentry from '@sentry/electron';
import log from 'electron-log/main';
import { trayApp } from './view';
import { autoUpdater } from 'electron-updater';
import os from 'os';

const url = `https://release.ii-uvp.com/update/${os.platform()}${os.arch()}/latest.yml`;
console.log(url);

Sentry.init({
  dsn: 'https://7a655273ab05804053ea0459f6bb808b@o4506161259544576.ingest.sentry.io/4506161263083520'
});

const { updateDevice, updateStatusDevice, lastUpdateDevice } = deviceWorker;
const { updateAirtime, generatePlaylistForDevice } = airtimeWorker;
const { downloadAirtimeFiles } = downloadWorker;
const { uploadLogs } = uploadWorker;

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

  const tray = trayApp.initTray();
  tray.setToolTip('uvplayer');
  tray.setContextMenu(trayApp.createContextMenu());
});

async function createWindow() {
  initial.initialDefaultFolder();
  await updateDevice();
  let width = 600;
  let height = 600;
  let x = 0;
  let y = 0;
  const device = store.get('device');

  if (device) {
    // Sentry.setUser({ id: device?._id, username: device?.deviceName });
    // Sentry.setTag('deviceName', device?.deviceName);
    // Sentry.setTag('location', device?.location);
    const [widthStr, heightStr] = device.screens.split('x');
    const [xStr, yStr] = device.position.split('x');

    // Перетворіть рядки на числа
    width = parseInt(widthStr);
    height = parseInt(heightStr);
    x = parseInt(xStr);
    y = parseInt(yStr);
  }
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: width === 0 ? 700 : width,
    height: height === 0 ? 700 : height,
    x: x,
    y: y,
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
  generatePlaylistForDevice();
  try {
    await updateStatusDevice();
    await updateAirtime();
    await downloadAirtimeFiles();
    await uploadLogs();
    await lastUpdateDevice();
  } catch (error) {
    log.error(error);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

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

autoUpdater.autoDownload = true;

function sendStatusToWindow(text) {
  log.error(text);
  // Тут можна надсилати статус до вікна додатку, якщо потрібно
}

autoUpdater.setFeedURL({
  url: url,
  serverType: 'json',
  provider: 'generic',
  useMultipleRangeRequest: false
});

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', () => {
  sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', () => {
  sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
  log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
  log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', () => {
  sendStatusToWindow('Update downloaded; will install now');

  autoUpdater.quitAndInstall();
});

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
