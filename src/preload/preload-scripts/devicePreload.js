import { ipcRenderer } from 'electron';
import { store } from '../../utils';
export default {
  fetchDevice: (activateKey) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('fetch-device', activateKey);
      ipcRenderer.once('fetch-device-response', (event, data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });
    });
  },
  currentDevice: () => {
    return new Promise((resolve, reject) => {
      try {
        const device = store.get('device');
        resolve(device);
      } catch (err) {
        reject(err);
      }
    });
  }
};
