import Store from 'electron-store';
const store = new Store();
store.set('STORAGE', {
  AIRTIME: 'data/content/airtime',
  HOT_PLAYLIST: 'data/content/hot-playlist',
  CLIPS: 'data/content/clips',
  LOGS_MEDIA: 'data/logs/logs_media',
  LOGS_ERROR: 'data/logs/logs_error'
});

export default store;
