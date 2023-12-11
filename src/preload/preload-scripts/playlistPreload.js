import { ipcRenderer } from 'electron';
export default {
  getPlaylist: () => ipcRenderer.invoke('playlist:generate')
};
