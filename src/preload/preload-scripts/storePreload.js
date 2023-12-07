import { ipcRenderer } from 'electron';
export default {
  subscribeToStore: (storeKey, callback) => {
    ipcRenderer.on('store-data-changed', (event, newValue) => {
      if (callback) callback(newValue);
    });
    ipcRenderer.send('subscribe-to-store', storeKey);
  },
  unsubscribeFromStore: (storeKey) => {
    ipcRenderer.send('unsubscribe-from-store', storeKey);
  }
};
