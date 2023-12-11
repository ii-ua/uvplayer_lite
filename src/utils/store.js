import Store from 'electron-store';
const store = new Store();
store.set('STORAGE', {
  CONTENT: 'data/content/',
  CONF: 'data/conf',
  LOGS_MEDIA: 'data/logs/logs_media',
  LOGS_ERROR: 'data/logs/logs_error'
});

export default store;
