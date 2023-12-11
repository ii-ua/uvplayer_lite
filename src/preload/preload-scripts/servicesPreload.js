import { ipcRenderer } from 'electron';
export default {
  getFoldersGoogle: () => ipcRenderer.invoke('google:get-folders')
};
