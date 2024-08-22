import { ipcMain } from 'electron';
import { store } from '../../../utils';
import log from 'electron-log/main';
import AutoLaunch from 'auto-launch';

ipcMain.handle('store:get-setting', () => {
  let setting = '';
  try {
    setting = store.get('setting');
    return setting;
  } catch (err) {
    log.error(err);
    return setting;
  }
});

ipcMain.on('store:save-setting', (event, setting) => {
  try {
    store.set('setting', setting);
    const autoLauncher = new AutoLaunch({
      name: 'uvplayer'
    });

    autoLauncher.isEnabled().then(async (isEnabled) => {
      if (isEnabled) {
        try {
          await autoLauncher.disable();
        } catch (err) {
          log.error(err);
        }
      } else {
        try {
          await autoLauncher.enable();
        } catch (err) {}
      }
    });
  } catch (err) {
    log.error(err);
  }
});

ipcMain.on('store:subscribe', (event, storeKey) => {
  const changeListener = (newValue) => {
    event.sender.send('store:changed', storeKey, newValue);
  };

  const unsubscribe = store.onDidChange(storeKey, changeListener);

  // Збереження функції для видалення підписки
  event.sender.once(`store:unsubscribe-${storeKey}`, () => {
    unsubscribe();
  });
});

ipcMain.on('store:unsubscribe', (event, storeKey) => {
  event.sender.emit(`store:unsubscribe-${storeKey}`);
});
