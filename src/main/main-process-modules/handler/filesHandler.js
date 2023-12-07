import { ipcMain } from 'electron';
import fs from 'fs';

ipcMain.on('read-file', (event, filePath) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      event.sender.send('file-data', { error: err.message });
      return;
    }
    event.sender.send('file-data', { data });
  });
});
