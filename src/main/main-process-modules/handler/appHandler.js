import { ipcMain, app } from 'electron';

ipcMain.on('relaunch-app', () => {
  app.relaunch();
  app.quit();
});
