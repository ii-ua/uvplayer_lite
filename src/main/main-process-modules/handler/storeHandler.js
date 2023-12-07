import { ipcMain } from 'electron';
import { store } from '../../../utils';
import log from 'electron-log/main';

ipcMain.on('save-key', (event, data) => {
  store.set('activationKey', data.activateKey);
  log.warn('Received save-key in main process.');

  try {
    log.warn('Key successfully saved in main process.');
    event.reply('key-saved');
  } catch (error) {
    log.error('Error while saving the key:', error);
  }
});

ipcMain.on('get-activationKey', (event) => {
  const activationKey = store.get('activationKey');
  event.reply('get-activationKey-response', activationKey);
});

ipcMain.on('subscribe-to-store', (event, storeKey) => {
  const changeListener = (newValue) => {
    event.sender.send('store-data-changed', storeKey, newValue);
  };

  store.onDidChange(storeKey, changeListener);

  // Збереження функції для видалення підписки
  event.sender.once(`unsubscribe-${storeKey}`, () => {
    store.offDidChange(storeKey, changeListener);
  });
});

ipcMain.on('unsubscribe-from-store', (event, storeKey) => {
  event.sender.emit(`unsubscribe-${storeKey}`);
});
