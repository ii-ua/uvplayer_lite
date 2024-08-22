import Store from 'electron-store';
const store = new Store();
import { app } from 'electron';
import path from 'path';
store.set('STORAGE', {
  CONF: path.join(app.getPath('userData'), 'data', 'conf'),
  CONTENT: path.join(app.getPath('userData'), 'data', 'content'),
  LOGS_MEDIA: path.join(app.getPath('userData'), 'data', 'logs', 'logs_media'),
  LOGS_ERROR: path.join(app.getPath('userData'), 'data', 'logs', 'logs_error')
});

export default store;
