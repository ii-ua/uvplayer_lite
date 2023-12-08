import { ipcRenderer } from 'electron';
export default {
  navigate: (callback) => ipcRenderer.on('request-navigate', (_event, path) => callback(path))
};
