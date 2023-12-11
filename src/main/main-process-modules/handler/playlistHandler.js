import { ipcMain } from 'electron';
import { playlist } from '../../../utils';

ipcMain.handle('playlist:generate', () => {
  const items = playlist.generatePlaylist();
  return items;
});
