import { ipcRenderer } from 'electron';
export default {
  getSetting: () => ipcRenderer.invoke('store:get-setting'),
  saveSetting: (setting) => ipcRenderer.send('store:save-setting', setting),
  subscribeToStore: (storeKey, callback) => {
    ipcRenderer.on('store:changed', (event, newValue) => {
      if (callback) callback(newValue);
    });
    ipcRenderer.send('store:subscribe', storeKey);
  },
  unsubscribeFromStore: (storeKey) => {
    ipcRenderer.send('store:unsubscribe', storeKey);
  }
};
