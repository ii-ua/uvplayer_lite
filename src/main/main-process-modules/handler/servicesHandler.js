import { ipcMain } from 'electron';
import { googleApi } from '../../../services/api';

ipcMain.handle('google:get-folders', async () => {
  const folders = await googleApi.listFoldersGoogle();
  return folders;
});
