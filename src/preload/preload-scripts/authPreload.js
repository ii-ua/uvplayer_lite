import { ipcRenderer } from 'electron';
import { store } from '../../utils';
export default {
  saveKeyAndRelaunch: async (data) => {
    ipcRenderer.send('save-key', data);
    await new Promise((resolve) => {
      ipcRenderer.once('key-saved', () => {
        resolve('Received key-saved!');
      });
    });
    ipcRenderer.send('relaunch-app');
  },
  getActivationKey: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-activationKey');
      ipcRenderer.once('get-activationKey-response', (event, key) => {
        if (key) {
          resolve(key);
        } else {
          reject('No key found');
        }
      });
    });
  },
  setApiUrl: (apiUrl) => {
    store.set('SERVER_URL', {
      API_URL: `https://${apiUrl}/api/v1`,
      SOCKET_URL: `https://${apiUrl}`
    });
  }
};
