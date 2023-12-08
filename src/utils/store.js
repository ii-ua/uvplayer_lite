import Store from 'electron-store';
const store = new Store();
store.set('STORAGE', {
  CONTENT: 'data/content/',
  CREDENTIALS: 'data/credentials',
  LOGS_MEDIA: 'data/logs/logs_media',
  LOGS_ERROR: 'data/logs/logs_error'
});

export default store;
